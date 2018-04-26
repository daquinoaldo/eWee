#include "ble-sampler.h"

#include <HardwareSerial.h>
#include <string>
#include <unordered_map>

#include "BLEDevice.h"
#include "BLEScan.h"


// ----- ----- BLE AD FOUND CALLBACK ----- ----- //
class BleSamplerManager::BleAdCallbacks: public BLEAdvertisedDeviceCallbacks 
{
  BleSamplerManager* mParent;

  public:
    BleAdCallbacks(BleSamplerManager* tParent): BLEAdvertisedDeviceCallbacks()
    {
      mParent = tParent;
    }
  
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    if (advertisedDevice.haveServiceUUID()) { 
      BLEUUID serviceUUID = advertisedDevice.getServiceUUID();
      std::string uuid_16bit = serviceUUID.toString().substr(4, 4); // Extracting 16bit service uuid
      if (uuid_16bit=="180a") {        
        BLEAddress* advertiseAddress = new BLEAddress(advertisedDevice.getAddress());
        mParent->SetMasterAddress(advertiseAddress);
        advertisedDevice.getScan()->stop();
      } // Found a device capable of routing to Master Head
    }
  } // onResult
}; // BleSamplerManager



// ----- ----- CONSTRUCTOR ----- ----- //
BleSamplerManager::BleSamplerManager() 
{
  
}


// ----- ----- BLE SERVER ----- ----- //
void BleSamplerManager::ServiceSetup(std::string tUuid)
{
  BLEDevice::init(tUuid);
  mBleServer = BLEDevice::createServer();
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


// ----- ----- GATEWAY MANAGEMENT ----- ----- //
void BleSamplerManager::SetMasterAddress(BLEAddress* tMasterAddress)
{
  if (mBleMasterAddress!=NULL) delete mBleMasterAddress;
  mBleMasterAddress = tMasterAddress;
}

bool BleSamplerManager::SubscribeToMaster() 
{
  if (mBleMasterAddress==NULL) return false;

  BLEClient*  client  = BLEDevice::createClient();
  client->connect(*mBleMasterAddress);

  BLERemoteService* subscribeService = client->getService(SUBSCRIBE_SERV_UUID);
  if (subscribeService == NULL) return false;

  BLERemoteCharacteristic* subscribeCharacteristic = subscribeService->getCharacteristic(SUBSCRIBE_CHAR_UUID);
  if (subscribeCharacteristic == NULL) return false;

  std::string myMacAddress = (BLEDevice::getAddress()).toString();
  subscribeCharacteristic->writeValue(myMacAddress.c_str());
  delay(50); // Delay to make sure the device wrote
  client->disconnect(); // Now we can disconnect
  
  return true;
}

void BleSamplerManager::FindMaster() 
{
  SetMasterAddress(NULL);
  BLEScan* pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new BleAdCallbacks(this));
  pBLEScan->setActiveScan(true);
  pBLEScan->start(30);
}

