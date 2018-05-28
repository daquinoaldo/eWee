#include "ble-sampler.h"

#include <HardwareSerial.h>
#include <string>
#include <climits>
#include <unordered_map>
#include <vector>

#include "BLEDevice.h"
#include "BLEScan.h"


// ----- ----- CONSTRUCTOR ----- ----- //
BleSamplerManager::BleSamplerManager() 
{

}


// ----- ----- BLE TOP LEVEL ----- ----- //
void BleSamplerManager::ServiceSetup(std::string tuuid)
{
  BLEDevice::init(tuuid);
  mBleServer = BLEDevice::createServer();
  mEnvirService = mBleServer->createService(tuuid);
}

void BleSamplerManager::ServiceStart()
{
  mEnvirService->start();
  BLEAdvertising *pAdvertising = mBleServer->getAdvertising();
  pAdvertising->addServiceUUID(mEnvirService->getUUID());
  pAdvertising->start();
}


// ----- ----- BLE CHARACTERISTICS MANAGEMENT ----- ----- //
void BleSamplerManager::NewCharacteristic(std::string tuuid, uint32_t tProperties)
{
  // Initializing a new characteristic
  BLECharacteristic* aus = mEnvirService->createCharacteristic(tuuid, tProperties);
  // Mapping the characteristic
  mCharacteristicTable.emplace(tuuid, aus);
}


bool BleSamplerManager::SetCharacteristic(std::string tuuid, std::string tValue)
{
  if (mCharacteristicTable.find(tuuid) == mCharacteristicTable.end()) return false;
  mCharacteristicTable[tuuid]->setValue(tValue);
  return true; 
}

std::string BleSamplerManager::GetCharacteristic(std::string tuuid)
{
  if (mCharacteristicTable.find(tuuid) == mCharacteristicTable.end()) return NULL;
  return (mCharacteristicTable[tuuid]->getValue());
}

