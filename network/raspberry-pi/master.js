// ----- ----- REQUIREMENTS ----- ----- //
const noble = require('noble');
const moment = require('moment');

const UUID = require('../UUIDs.js');
const Query = require('../../database/query.js').Query;


// ----- ----- COSTANTS ----- ----- //
const ENVIR_SENSING = '181a'; // Our main service
const CONNECTION_TIMEOUT = 5000;
const SEPARET = '\n/// ///// ///// /// \n';


// ----- ----- GLOBALS ----- ----- //
const connectedIDs = {}; // Devices seen
let pendingActions = []; // Actuators to be set
// const pendingActions = [
//   { 'mac': '30:ae:a4:1c:c2:ee',
//     'uuid_16': '0003',
//     'value': 'true'},
// ];

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
}
setup();


// ----- ----- MAIN LOGIC ----- ----- //
async function masterLogic (peripheral) {
  // Trying to connect
  try {
    await getConnectionPromise(peripheral, CONNECTION_TIMEOUT);
    console.log(peripheral.address + ' (connected)');
  } catch (e) {
    console.log(SEPARET + '(' + peripheral.address + ')' + "Service discovery error: " + e + SEPARET);
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
    if(services.length==0) throw "No services found";
  } catch (e) {
    console.log(SEPARET + e + SEPARET);
    delete connectedIDs[peripheral.address];
    peripheral.disconnect((e) => console.log('Error while disconnecting: '+e));
    return false;
  } // Handling error

  // We have found services, need to look for ENVIR_SENSING service
  let sensingService = null;
  for (const i in services) {
    // 0000xxxx-0000-1000-8000-00805F9B34F (128bit representation of 16bit UUID)
    const serviceUUID_16 = services[i].uuid.toString().substring(4, 8);
    if (serviceUUID_16 === ENVIR_SENSING) { sensingService = services[i]; break; }
    else console.log(serviceUUID_16);
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
    console.log(SEPARET + e + SEPARET);
    delete connectedIDs[peripheral.address];
    peripheral.disconnect();
    return false;
  }

  async function sampleCycle () {
    // Trying to retrieving data
    try {
      await getExecutionPromise(peripheral, characteristicTable, [], CONNECTION_TIMEOUT);
      const sample = await getSamplePromise(peripheral, characteristicTable, CONNECTION_TIMEOUT);
      // Data retrieved correctly, we can use it
      console.log(sample);
      // Query.insertMeasure(translator(sample));
      // Ensuring to continue sampling
      setTimeout(sampleCycle, 5000);
    } catch (e) {
      console.log(SEPARET + e + SEPARET);
      delete connectedIDs[peripheral.address];
      peripheral.disconnect();
    } // Stop if some error occurs
  }
  sampleCycle();
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
    peripheral.discoverServices(null, (error, services) => error ? reject('error') : resolve(services));
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
      if (error) reject(error); // Ooops, something went wrong
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
  let todo = pendingActions[peripheral.address];
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
 * @return: true if no error occurres, the error otherwise
 */
function getExecutionPromise (peripheral, characteristicTable, errorsArray, timeout) {
  // Ensuring the error array is empty before starting
  errorsArray.splice(0, errorsArray.length);

  return new Promise(async function (resolve, reject) {
    // Finding actions to execute
    todo = pendingActions.find((el) => { return el.mac==peripheral.address });
    // Iterating till there is something to do
    while (todo != null) {
      // Getting the characteristic
      let characteristic = characteristicTable.find( (el) => {
        let uuid_16 = el.uuid.toString().substring(4, 8);
        return (uuid_16==todo.uuid_16);
      });

      if (characteristic!=null) {
        try {
          // @note: the order in which the actions are executed may be important
          await getWritePromise(characteristic, todo.value, timeout);
          pendingActions = pendingActions.splice(pendingActions.indexOf(todo), 1);
        } catch (e) {
          errorsArray.push({error: e, action: todo});
        }
      } // if the characteristic exist, then need to set the actuator
      else {
        pendingActions = pendingActions.splice(pendingActions.indexOf(todo), 1);
      } // Otherwise we can delete the pending action

      // Preparing for next iteration
      todo = pendingActions.find((el) => {
        console.log(pendingActions);
        return el.mac==peripheral.address
      });
    }
    if (errorsArray.length>0) reject('Some errors occurred');
    resolve(true);
  });
}

//TODO: never used
function getDelayPromise (msec) {
  return new Promise((resolve, reject) => {
    setTimeout(() => resolve("done!"), msec)
  })
}


// ----- ----- CALLBACK LAND ----- ----- //
/*
 * Callback for disconnections events
 */
//TODO: never used
function handleDisconnection (peripheral, error) {
  let devName = peripheral.advertisement.localName;
  console.log('Disconnected from ' + devName);
  if (error) console.log(error);
}


// ----- ----- TRANSLATOR ----- ----- //
function translator (obj) {
  const newObj = {};
  newObj.id = obj.device;
  newObj.timestamp = obj.timestamp;
  for (const uuid in obj) {
    const property = UUID.UUIDToProperty(uuid);
    if (property) newObj[property] = obj[uuid];
  }
  return newObj;
}

function isSampler (peripheral) {
  let devname = peripheral.advertisement.localName;
  if (devname==null || devname.length<7) return false;
  return (devname.substring(0, 7)==='sampler')
}
