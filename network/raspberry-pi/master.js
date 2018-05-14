// ----- ----- REQUIREMENTS ----- ----- //
var noble = require('noble');
var moment = require('moment');


// ----- ----- COSTANTS ----- ----- //
var ENVIR_SENSING = '181a' // Our main service
var NOT_A_SAMPLE = 'not a sample'


// ----- ----- GLOBALS ----- ----- //
var connectedIDs = {}; // Devices seen


/*
 * Starting the ble interface and scanning
 */
noble.on('stateChange', (state) => {
  if (state == 'poweredOn') {
    noble.startScanning([], true);
  }
});


// ----- ----- SCANNER ----- ----- //
noble.on('discover', (peripheral) => {
  let devId = peripheral.id;
  let devName = peripheral.advertisement.localName; // Ble advertisment name (sampler_xxxxx)
  if (!connectedIDs[peripheral.id] && devName && devName.substring(0, 7)=='sampler') {
console.log(connectedIDs);
    connectedIDs[peripheral.id] = 'known'; // Updating the known device table
    masterLogic(peripheral);
  } // The device is a sample
});


// ----- ----- MAIN LOGIC ----- ----- //
var masterLogic = async function (peripheral) {
  peripheral.cname = peripheral.advertisement.localName;

  peripheral.once('disconnect', () => {
    console.log(peripheral.cname + ' (disconnected)');
    // connectedIDs[peripheral.id] = null;
  });

  // Trying to connect
  let connectionPromise = getConnectionPromise(peripheral);
  try {
    var result = await connectionPromise;
    console.log(peripheral.cname + ' (connected)');
  } catch (e) {
    console.log(SEPARET + e + SEPARET);
    connectedIDs[peripheral.id] = null;
    return false;
  } // Connection error

  // We are now connected
  noble.startScanning();
  connectedIDs[peripheral.id] = 'connected';

  // Trying to discover services
  let serviceDiscoveryPromise = getServiceDiscoveryPromise(peripheral);
  try {
    var services = await serviceDiscoveryPromise; // TODO: qui si pianta se il device si disconnette
    console.log('1)' + peripheral.cname + ': got services');
  } catch (e) {
    console.log(SEPARET + e + SEPARET);
    connectedIDs[peripheral.id] = null;
    peripheral.disconnect();
    return false;
  } // Handling error

  // We have found services, need to look for ENVIR_SENSING service
  let sensingService = null;
  for (var i in services) {
    // 0000xxxx-0000-1000-8000-00805F9B34F (128bit representation of 16bit UUID)
    serviceUUID_16 = services[i].uuid.toString().substring(4, 8);
    if (serviceUUID_16 == ENVIR_SENSING) { sensingService = services[i]; break; }
  }
  // If we haven't our service, let's disconnect and no reconncet anymore
  if(sensingService == null) {
    connectedIDs[peripheral.id] = 'notAnEsp32'; // the device isn't an esp32
    peripheral.disconnect();
    return false;
  }

  // We have our service, let's browse the available characteristic
  let characteristicPromise = getCharacteristicPromise(sensingService);
  try {
    var characteristicTable = await characteristicPromise;
    console.log('2)' + peripheral.cname + ': got char table');
  } catch (e) {
    console.log(SEPARET + e + SEPARET);
    connectedIDs[peripheral.id] = null;
    return false;
  }

  let sampleCycle = async function () {
    // Traing to retrieving data
    samplePromise = getSamplePromise(peripheral, characteristicTable);
    try {
      var sample = await samplePromise;
    } catch (e) {
      console.log(SEPARET + e + SEPARET);
      connectedIDs[peripheral.id] = null;
    } // Stop if some error occurs

    // Data retrieved correctly, we can use it
    console.log(sample);

    // Ensuring to continue sampling
    setTimeout(sampleCycle, 1000);
  }
  sampleCycle();
}

// ----- ----- PROMISES LAND ----- ----- //
/*
 * Promises to connect to a peripheral device
 * @returns: the string 'connected' if no error occur, otherwise the error
 *   itself
 */
var getConnectionPromise = function (peripheral) {
  var connectionPromise = new Promise(function(resolve, reject) {
    peripheral.connect(
      (error) => { error ? reject(error) : resolve('connected'); }
    );
  });
  return connectionPromise;
}

/*
 * Promises to discover all service exposed by peripheral
 * @returns: null if an error occurres, an array of services otherwise
 */
var getServiceDiscoveryPromise = function (peripheral) {
  let servicePromise = new Promise(function(resolve, reject) {
    peripheral.discoverServices([],
      (error, services) => { error ? reject('error') : resolve(services); }
    );
  });
  return servicePromise;
}

/*
 * Promises to discover all the characteristic hosted on a given service
 * @return: null if an error occurres, an array of characteristic otherwise
 */
var getCharacteristicPromise = function (service) {
  let characteristicPromise = new Promise(function(resolve, reject) {
    service.discoverCharacteristics([], (error, characteristics) => {
      error ? reject('error') : resolve(characteristics);
    });
  });
  return characteristicPromise;
}

/*
 * Promises to read a characteristic
 * @return: null if some error occurred. An object containing
 *   the data read, in the 'data' field, and the characteristic 16bit uuid, into
 *   the 'uuid_16' field, otherwise.
 * @note: the function read hangs if the connection is lost
 */
var getReadPromise = function (characteristic) {
  let readPromise = new Promise(function(resolve, reject) {
    characteristic.read( (error, data) => {
      if (error) reject(error); // Ooops, something went wrong
      // Let's return a good formatted data structure
      let asciiData = data.toString('ascii');
      let uuid_16 = characteristic.uuid.toString().substring(4, 8);
      resolve({'uuid_16': uuid_16, 'data': asciiData});
    });
  });
  return readPromise;
}

/*
 * Promises to read all the characteristics (a sample) from
 * the result of a 'discoverCharacteristics' invocation
 * @return: null if some error occurres, otherwise an object containing the
 *   sample read and the device name stored into the 'device' field
 * @note: the promise isn't resolved/rejected if the connection is lost
 *   (characteristic.read doesn't throw errors, it simply hangs)
 */
var getSamplePromise = function (peripheral, characteristicTable) {
  var samplePromise = new Promise(async function(resolve, reject) {
    // Adding basic info
    var time = moment();
    var time_format = time.format('YYYY-MM-DD HH:mm:ss Z');
    let peripheralData = {
      'device': peripheral.address,
      'timestamp': time_format
    };
    // Iterating over all the characteristics
    for (let characteristic of characteristicTable) {
      let readPromise = getReadPromise(characteristic);
      try {
        var res = await readPromise;
        peripheralData[res.uuid_16] = res.data; // Updating sample data
      } catch (e) {
        console.log(e);
      }
    }
    resolve(peripheralData);
  });
  return samplePromise;
}

var getDelayPromise = function (msec) {
  let promise = new Promise((resolve, reject) => {
    setTimeout(() => resolve("done!"), msec)
  });
  return promise
}


// ----- ----- CALLBACK LAND ----- ----- //
/*
 * Callback for disconnections events
 */
var handleDisconnection = function (peripheral, error) {
  let devName = peripheral.advertisement.localName;
  console.log('Disconnected from ' + devName);
  if (error) console.log(error);
}
