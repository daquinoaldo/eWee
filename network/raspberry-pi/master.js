// ----- ----- REQUIREMENTS ----- ----- //
const noble = require('noble');

const UUID = require('../UUIDs.js');
const Query = require('../../database/query.js').Query;


// ----- ----- COSTANTS ----- ----- //
// Our main service:
// https://www.bluetooth.com/specifications/gatt/viewer?attributeXmlFile=org.bluetooth.service.automation_io.xml
const AUTOMATION_IO = '181a';
/*
 * @note: the 'noble' dependency, used for ble, get stuck on remote invocations
 *   if the other device goes offline. To work around this problem we've
 *   introduced timer to each remote call. After 'CONNECTION_TIMEOUT' each
 *   call is considered 'stuck' and the binded promise rejects the request.
 */
const CONNECTION_TIMEOUT = 5000;


// ----- ----- GLOBALS ----- ----- //
// An array of information regarding the devices seen
const connectedIDs = {};
// Contains all the action to execute
let pendingActions = [];
// Store the timestamp of the last time we've queried for the pending actions
let lastActionTimestamp = new Date();


setInterval(() => Query.getActions(lastActionTimestamp).then(actions => {
  for (let i = 0; i < actions.length; i++)
    pendingActions.push(reverseTranslator(actions[i]))
  if (actions.length && actions[actions.length-1].timestamp) lastActionTimestamp = actions[actions.length-1].timestamp;
}), 1000);

/*
 * It seems that noble stop scanning from time to time
 */
setInterval(() => noble.startScanning(), 10000);


// ----- ----- SETUP AND START ----- ----- //
async function setup() {
  await Query.init();

  /*
   * Starting the ble interface and scanning
   */
  noble.on('stateChange', (state) => {
    if (state === 'poweredOn') {
      noble.startScanning([], true);
    }
  });
  // It seems that noble stop scanning from time to time
  setInterval(() => noble.startScanning(), 10000);

  /*
   * Manages the device discovery
   */
  noble.on('discover', (peripheral) => {
    console.log('Found:' + peripheral.address);
    if (!connectedIDs[peripheral.address] && isSampler(peripheral)) {
      connectedIDs[peripheral.address] = 'known'; // Updating the known device table
      masterLogic(peripheral);
    } // The device is a sample
  });

  /*
   * Querying actions every 1000 milliseconds (updating what to do)
   */
  setInterval(() => Query.getActions(lastActionTimestamp).then(actions => {
    console.log(JSON.stringify(actions));
    for (let i = 0; i < actions.length; i++)
      pendingActions.push(reverseTranslator(actions[i]))
    if (actions.length && actions[actions.length-1].timestamp) lastActionTimestamp = actions[actions.length-1].timestamp;
  }), 10000);
}
setup();


// ----- ----- MAIN LOGIC ----- ----- //
async function masterLogic (peripheral) {
  // Trying to connect
  try {
    await getConnectionPromise(peripheral, CONNECTION_TIMEOUT);
    console.log(peripheral.address + ' (connected)');
  } catch (e) {
    console.error('(' + peripheral.address + ') ' + "Service discovery error: " + e);
    delete connectedIDs[peripheral.address];
    peripheral.disconnect();
    return false;
  } // Connection error

  // We are now connected
  noble.startScanning();
  connectedIDs[peripheral.address] = 'connected';

  // Trying to discover services
  let services = [];
  try {
    services = await getServiceDiscoveryPromise(peripheral, CONNECTION_TIMEOUT)
  } catch (e) {
    console.error(e);
    delete connectedIDs[peripheral.address];
    peripheral.disconnect((e) => {
      console.error('('+peripheral.address+') '+'Error while disconnecting: '+e);
    });
    return false;
  } // Handling error

  // We have found services, need to look for AUTOMATION_IO service
  let sensingService = null;
  for (const i in services) {
    // 0000xxxx-0000-1000-8000-00805F9B34F (128bit representation of 16bit UUID)
    const serviceUUID_16 = services[i].uuid.toString().substring(4, 8);
    if (serviceUUID_16 === AUTOMATION_IO) {
      sensingService = services[i];
      break;
    } // We've found our service
  }
  // If we haven't our service, let's disconnect and no reconnect anymore
  if(sensingService == null) {
    connectedIDs[peripheral.address] = 'notAnEsp32'; // the device isn't an esp32
    console.log("Not an ESP32, disconnect.");
    peripheral.disconnect();
    return false;
  }

  // We have our service, let's browse the available characteristic
  let characteristicTable;
  try {
    characteristicTable = await getCharacteristicPromise(sensingService, CONNECTION_TIMEOUT);
    console.log('2) ' + peripheral.address + ': got char table');
  } catch (e) {
    console.error('(' + peripheral.address + ') ' + 'Error while getting characteristic table: ' + e);
    delete connectedIDs[peripheral.address];
    peripheral.disconnect();
    return false;
  }

  async function peripheralCycle () {
    // Trying to retrieving data
    try {
      await getExecutionPromise(peripheral, characteristicTable, CONNECTION_TIMEOUT);
      const sample = await getSamplePromise(peripheral, characteristicTable, CONNECTION_TIMEOUT);
      // Data retrieved correctly, we can use it
      console.log(sample);
      Query.insertMeasure(translator(sample));
      // Ensuring to continue sampling
      setTimeout(peripheralCycle, 5000);
    } catch (e) {
      console.error('(' + peripheral.address + ') ' + 'Error while peripheral cycling: ' + e);
      delete connectedIDs[peripheral.address];
      peripheral.disconnect();
    } // Stop if some error occurs
  }
  peripheralCycle();
}


// ----- ----- PROMISES LAND ----- ----- //
/*
 * Promises to connect to a peripheral device at most in 'timeout' milliseconds.
 *   Otherwise the promise is rejected.
 * @returns: the string 'connected' if no error occur, otherwise the error
 *   itself
 */
function getConnectionPromise (peripheral, timeout) {
  return new Promise(function (resolve, reject) {
    peripheral.connect((error) => error ? reject(error) : resolve('connected'));
    setTimeout(() => reject('(' + peripheral.address + ') ' + 'Connection error: time elapsed '), timeout);
  });
}

/*
 * Promises to discover all service exposed by peripheral at most in 'timeout'
 *   milliseconds. Otherwise the promise is rejected.
 * @returns: null if an error occurs, an array of services otherwise
 */
function getServiceDiscoveryPromise (peripheral, timeout) {
  return new Promise(function (resolve, reject) {
    peripheral.discoverServices(null, (error, services) => {
      if (error) reject(error);
      else if (services.length === 0) reject('No services found');
      else resolve(services);
    });
    setTimeout(() => reject('(' + peripheral.address + ') ' + 'Service discovery error: time elapsed '), timeout);
  });
}

/*
 * Promises to discover all the characteristic hosted on a given service at
 *   most in 'timeout' milliseconds. Otherwise the promise is rejected.
 * @return: null if an error occurres, an array of characteristic otherwise
 */
function getCharacteristicPromise (service, timeout) {
  return new Promise(function (resolve, reject) {
   service.discoverCharacteristics([], (error, characteristics) => error ? reject(error) : resolve(characteristics));
   setTimeout(() => reject('Discover characteristic error: time elapsed '), timeout);
 });
}

/*
 * Promises to read a characteristic at most in 'timeout' milliseconds.
 *   Otherwise the promise is rejected.
 * @return: null if some error occurred. An object containing
 *   the data read, in the 'data' field, and the characteristic 16bit uuid, into
 *   the 'uuid_16' field, otherwise.
 * @note: the function read hangs if the connection is lost
 */
function getReadPromise (characteristic, timeout) {
  return new Promise(function (resolve, reject) {
    characteristic.read((error, data) => {
      // @note: it may happen that no error occurres but data is undefined
      if (error || !data) reject(error);
      // Let's return a good formatted data structure
      let asciiData = data.toString('ascii');
      let uuid_16 = characteristic.uuid.toString().substring(4, 8);
      resolve({'uuid_16': uuid_16, 'data': asciiData});
    });
    setTimeout(() => reject('read: max time elapsed'), timeout);
  });
}

/*
 * Promises to write a characteristic at most in 'timeout' milliseconds.
 *   Otherwise the promise is rejected.
 * @return: True if the characteristic has been properly wrote, false otherwise
 */
function getWritePromise (characteristic, data, timeout) {
  let buf = Buffer.from(data, 'utf8');
  return new Promise(function (resolve, reject) {
    characteristic.write(buf, true, (error) => error ? reject(error) : resolve(true));
    setTimeout(() => reject('read: max time elapsed'), timeout);
  });
}

/*
 * Promises to read all the characteristics (a sample) from
 *   the result of a 'discoverCharacteristics' invocation at most in 'timeout'
 *   milliseconds. Otherwise the promise is rejected.
 * @return: null if some error occurres, otherwise an object containing the
 *   sample read and the device name stored into the 'device' field
 * @note: the promise isn't resolved/rejected if the connection is lost
 *   (characteristic.read doesn't throw errors, it simply hangs)
 */
function getSamplePromise (peripheral, characteristicTable, timeout) {
  // Getting all pending actions
  return new Promise(async function (resolve, reject) {
    // Adding basic info
    const time = new Date(new Date().toUTCString());
    let peripheralData = {
      'device': peripheral.address,
      'timestamp': time
    };
    // Iterating over all the characteristics
    for (let characteristic of characteristicTable) {
      try {
        const uuid_16 = characteristic.uuid.toString().substring(4, 8);
        const res = await getReadPromise(characteristic, timeout);
        peripheralData[res.uuid_16] = res.data; // Updating sample data
      } catch (e) {
        reject(e);
      }
    }
    resolve(peripheralData);
  });
}

/*
 * Promises to execute all pending actions wrt a given peripheral
 * @return: true if no error occurs, the error otherwise
 */
function getExecutionPromise (peripheral, characteristicTable, timeout) {
  let errorsArray = [];
  // Ensuring the error array is empty before starting
  errorsArray.splice(0, errorsArray.length);

  return new Promise(async function (resolve, reject) {
    // Finding actions to execute
    const todoIndex = pendingActions.findIndex((el) => { return el.device === peripheral.address });
    // Iterating till there is something to do
    while (todoIndex != -1) {
      const actualAction = pendingActions[todoIndex];
      pendingActions.slice(todoIndex, 1);
      // Searching for the characteristic in the device
      let newValue = null;
      let characteristic = characteristicTable.find( (el) => {
        // uuid returns 128bit addresses, we need to convert them into 16 bit
        let uuid_16 = el.uuid.toString().substring(4, 8);
        if (actualAction[uuid_16]!=null) {
          newValue = actualAction[uuid_16];
          return true;
        } // The characteristic and new value have been found
        else return false;
      });

      if (characteristic!=null) {
        try {
          // @note: the order in which the actions are executed may be important
          await getWritePromise(characteristic, newValue, timeout);
        } catch (e) {
          errorsArray.push(e + JSON.stringify(actualAction));
        }
      } // if the characteristic exist, then need to set the actuator
      else {
        errorsArray.push('Characteristic to trigger not found: ' + JSON.stringify(actualAction));
      } // Otherwise we can delete the pending action

      // Taking next action
      const todoIndex = pendingActions.findIndex((el) => { return el.device === peripheral.address });
    }
    // If some error occurred we have to reject
    if (errorsArray.length>0) reject(errorsArray);
    resolve(true);
  });
}


// ----- ----- TRANSLATOR ----- ----- //
/*
 * Translate an object, created by 'getSamplePromise', containing the measures
 *   read from the peripherals, into an object usable by the APIs
 */
function translator (obj) {
  const newObj = {};
  newObj.id = obj.device;
  newObj.timestamp = obj.timestamp;
  for (const uuid in obj) {
    const property = UUID.UUIDToProperty(uuid);
    if (property) newObj[property] = isNaN(+obj[uuid]) ? obj[uuid] : +obj[uuid];
  }
  return newObj;
}

/*
 * Translate an object returned by 'Query.getActions' (pendingActions) in a
 *   format easier to use by the master.
 */
function reverseTranslator (obj) {
  const newObj = {};
  newObj.device = obj.id;
  newObj.timestamp = obj.timestamp;
  for (const property in obj) {
    const uuid = UUID.propertyToUUID(property);
    if (uuid) newObj[uuid] = obj[property].toString();
  }
  return newObj;
}

/*
 * Returns true if compatible with our system
 * @note: our intent for the demo was to use only our devices.
 *   At the moment this function check only if the ble adv name starts with
 *   sampler. To make the system fully compatibile with every ble device
 *   this function has to return true every time
 */
function isSampler (peripheral) {
  /* ** UnCOMMENT FOR FULL COMPADIBILITY  ** */
  // return true;

  // @note: it may happen that name is correct but the mac address in unknown
  if (peripheral.address === 'unknown') return false;

  let devname = peripheral.advertisement.localName;
  if (devname==null || devname.length<7) return false;
  return (devname.substring(0, 7)==='sampler');
}
