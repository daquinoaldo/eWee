#include "ble-sampler.h"

#include <HardwareSerial.h>
#include <string>
#include <climits>
#include <unordered_map>
#include <vector>

#include "BLEDevice.h"
#include "BLEScan.h"


class BleSamplerManager::BleServerCallback: public BLEServerCallbacks
{
  bool* mIsConnected;

  public:
    BleServerCallback(bool* tIsConnected): BLEServerCallbacks()
    {
      mIsConnected = tIsConnected;
    }

  void onConnect(BLEServer* pServer) {
    *mIsConnected = true;
    Serial.println("///// ///// CONNECTED ///// /////");
  }

  void onDisconnect(BLEServer* pServer) {
    *mIsConnected = false;
    Serial.println("///// ///// DISCONNECTED ///// /////");
  }
};


// ----- ----- CONSTRUCTOR ----- ----- //
BleSamplerManager::BleSamplerManager() 
{

}


// ----- ----- BLE SERVER ----- ----- //
void BleSamplerManager::ServiceSetup(std::string tUuid)
{
  BLEDevice::init(tUuid);
  mBleServer = BLEDevice::createServer();
  mBleServer->setCallbacks(new BleServerCallback(&mConnected));
  mEnvirService = mBleServer->createService(tUuid);
}

void BleSamplerManager::NewCharacteristic(std::string tUuid, uint32_t tProperties)
{
  BLECharacteristic* aus = mEnvirService->createCharacteristic(tUuid, tProperties);
  mCharacteristicTable.emplace(tUuid, aus);
}

void BleSamplerManager::ServiceStart()
{
  mEnvirService->start();
  BLEAdvertising *pAdvertising = mBleServer->getAdvertising();
  pAdvertising->addServiceUUID(mEnvirService->getUUID());
  pAdvertising->start();
}

void BleSamplerManager::SetCharacteristic(std::string tUuid, std::string tValue)
{
  mCharacteristicTable[tUuid]->setValue(tValue);
}

bool BleSamplerManager::SubscribeToMaster() 
{
  bool subscribed = false;

  BLEScan* pBLEScan = BLEDevice::getScan();
  pBLEScan->setActiveScan(true);
  BLEScanResults devices = pBLEScan->start(15);
  pBLEScan->stop();
  
  BLEAddress* gatewayAddr = NULL;
  if(devices.getCount()!=0) {
    for (int i=0; i<devices.getCount(); i++) {
      BLEAdvertisedDevice dev = devices.getDevice(i);
      if (dev.haveServiceUUID()) { 
        BLEUUID serviceUUID = dev.getServiceUUID();
        std::string uuid_16bit = serviceUUID.toString().substr(4, 4); // Extracting 16bit service uuid
        if (uuid_16bit=="180a") {       
          gatewayAddr = new BLEAddress(dev.getAddress());
          break;
        } // Found a device capable of routing to Master Head
      } // Found a potential gateway
    } // for each device found
  } // Found some device
      
  if (gatewayAddr!=NULL) {
    BLEClient* mClient = BLEDevice::createClient();
    if(mClient->connect(*gatewayAddr)) {
      BLERemoteService* subscribeService = mClient->getService(SUBSCRIBE_SERV_UUID);
      if (subscribeService != NULL) {
        BLERemoteCharacteristic* subscribeCharacteristic = subscribeService->getCharacteristic(SUBSCRIBE_CHAR_UUID);
        if (subscribeCharacteristic != NULL) {
          std::string myMacAddress = (BLEDevice::getAddress()).toString();
          subscribeCharacteristic->writeValue(myMacAddress.c_str());
          subscribed = true;
        } // Found the subscription characteristic
      } // Found gateway service
    } // Successful connection
    delay(50); // Delay to make sure the device wrote
    mClient->disconnect(); // Now we can disconnect
//    delete mClient;
    delete gatewayAddr;
  }

  return subscribed;
}

bool BleSamplerManager::IsConnected() 
{
  return mConnected;
}

