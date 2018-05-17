// ----- ----- REQUIREMENTS ----- ----- //
const noble = require('noble');
const moment = require('moment');

const UUID = require('../UUIDs.js');
const Query = require('../../database/query.js').Query;


// ----- ----- COSTANTS ----- ----- //
const ENVIR_SENSING = '181a'; // Our main service
const CONNECTION_TIMEOUT = 2000;
const SEPARET = '\n/// ///// ///// /// \n';


// ----- ----- GLOBALS ----- ----- //
const connectedIDs = {}; // Devices seen
const pendingActions = {}; // Actuators to be set


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
    let devId = peripheral.id;  //TODO: not used
    let devName = peripheral.advertisement.localName; // Ble advertisement name (sampler_xxxxx)
    if (!connectedIDs[peripheral.id] && devName && devName.substring(0, 7)==='sampler') {
      connectedIDs[peripheral.id] = 'known'; // Updating the known device table
      masterLogic(peripheral);
    } // The device is a sample
  });
}
setup();


// ----- ----- MAIN LOGIC ----- ----- //
async function masterLogic (peripheral) {
  peripheral.cname = peripheral.advertisement.localName;

  peripheral.once('disconnect', () => {
    console.log(peripheral.cname + ' (disconnected)');
    // connectedIDs[peripheral.id] = null;
  });

  // Trying to connect
  try {
    await getConnectionPromise(peripheral, CONNECTION_TIMEOUT);
    console.log(peripheral.cname + ' (connected)');
  } catch (e) {
    console.log(SEPARET + e + SEPARET);
    connectedIDs[peripheral.id] = null;
    peripheral.disconnect();
    return false;
  } // Connection error

  // We are now connected
  noble.startScanning();
  connectedIDs[peripheral.id] = 'connected';

  // Trying to discover services
  let services;
  try {
    services = await getServiceDiscoveryPromise(peripheral, CONNECTION_TIMEOUT);
    console.log('1) ' + peripheral.cname + ': got services');
  } catch (e) {
    console.log(SEPARET + e + SEPARET);
    connectedIDs[peripheral.id] = null;
    peripheral.disconnect((e) => console.log('Error while disconnecting'+e));
    return false;
  } // Handling error

  // We have found services, need to look for ENVIR_SENSING service
  let sensingService = null;
  for (const i in services) {
    // 0000xxxx-0000-1000-8000-00805F9B34F (128bit representation of 16bit UUID)
    const serviceUUID_16 = services[i].uuid.toString().substring(4, 8);
    if (serviceUUID_16 === ENVIR_SENSING) { sensingService = services[i]; break; }
  }
  // If we haven't our service, let's disconnect and no reconncet anymore
  if(sensingService == null) {
    connectedIDs[peripheral.id] = 'notAnEsp32'; // the device isn't an esp32
    peripheral.disconnect();
    return false;
  }

  // We have our service, let's browse the available characteristic
  let characteristicTable;
  try {
    characteristicTable = await getCharacteristicPromise(sensingService, CONNECTION_TIMEOUT);
    console.log('2) ' + peripheral.cname + ': got char table');
  } catch (e) {
    console.log(SEPARET + e + SEPARET);
    connectedIDs[peripheral.id] = null;
    peripheral.disconnect();
    return false;
  }

  async function sampleCycle () {
    // Trying to retrieving data
    try {
      const sample = await getSamplePromise(peripheral, characteristicTable, CONNECTION_TIMEOUT);
      // Data retrieved correctly, we can use it
      console.log(sample);
      Query.insertMeasure(translator(sample));
      // Ensuring to continue sampling
      setTimeout(sampleCycle, 1000);
    } catch (e) {
      console.log(SEPARET + e + SEPARET);
      connectedIDs[peripheral.id] = null;
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
    setTimeout(() => reject('connect: max time elapsed'), timeout);
  });
}

/*
 * Promises to discover all service exposed by peripheral at most in 'timeout'
 *   milliseconds. Otherwise the promise is rejected.
 * @returns: null if an error occurs, an array of services otherwise
 */
function getServiceDiscoveryPromise (peripheral, timeout) {
  return new Promise(function (resolve, reject) {
    peripheral.discoverServices([], (error, services) => error ? reject('error') : resolve(services));
    setTimeout(() => reject('discoverServices: max time elapsed'), timeout);
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
   setTimeout(() => reject('discoverCharacteristics: max time elapsed'), timeout);
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
      let asciiData = data.toString('ascii'); //TODO: credo che ascii vada tolto
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
  return new Promise(function (resolve, reject) {
    characteristic.write(data, true, (error) => error ? reject(false) : resolve(true));
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
    const time = moment();
    const time_format = time.format('YYYY-MM-DD/HH:mm:ss');
    let peripheralData = {
      'device': peripheral.address,
      'timestamp': time_format
    };
    // Iterating over all the characteristics
    for (let characteristic of characteristicTable) {
      try {
        const uuid_16 = characteristic.uuid.toString().substring(4, 8); //TODO: uuid_16 never used
        if (todo != null && todo.uuid_16 != null) {
          await getWritePromise(characteristic, todo.uuid_16, timeout);
        } // There are some actions to be taken
        // Now is the time to read the value
        const res = await getReadPromise(characteristic, timeout);
        peripheralData[res.uuid_16] = res.data; // Updating sample data
      } catch (e) {
        reject(e);
      }
    }
    resolve(peripheralData);
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
  return obj;
}
