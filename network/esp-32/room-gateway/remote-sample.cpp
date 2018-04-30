#include "remote-sample.h"

#include <string>
#include <HardwareSerial.h>

#include "BLEDevice.h"
#include "BLEScan.h"
#include <BLEClient.h>

RemoteSample::RemoteSample (std::string mac) 
{
  mBleAddress = new BLEAddress(mac);
}

bool RemoteSample::GetSample(BLEClient* tclient, std::string* res)
{ 
  BLEClient* client = BLEDevice::createClient();
  if (!client->connect(*mBleAddress)) {
    *res = "Connection failed";
    return false;
  };
  
  // Obtain a reference to the service we are after in the remote BLE server.
  BLERemoteService* pRemoteService = client->getService(SENSING_SERVICE_UUID);
  if (pRemoteService == NULL) {
    *res = "Sensing service not found";
    return false;
  }

  // Obtain a reference to the characteristic in the service of the remote BLE server.
  BLERemoteCharacteristic* pRemoteCharacteristic = pRemoteService->getCharacteristic(TEMP_UUID);
  if (pRemoteCharacteristic == NULL) {
    *res = "Temperature characteristic not found";
    return false;
  }

  // Read the value of the characteristic.
  std::string temperature = pRemoteCharacteristic->readValue();
  *res = "Temperature: " + temperature;

  client->disconnect();
  return true;
}
