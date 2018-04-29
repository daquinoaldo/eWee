#ifndef samplerble_H
#define samplerble_H

#include <string>
#include <unordered_map>

#include "BLEDevice.h"
#include "BLEScan.h"

#define SUBSCRIBE_SERV_UUID (BLEUUID((uint16_t)0x180A)).toString()
#define SUBSCRIBE_CHAR_UUID (BLEUUID((uint16_t)0x8888)).toString()

class BleSamplerManager
{
  private:
    bool mConnected = false;
    // Ble main values
    BLEServer  *mBleServer;
    BLEService *mEnvirService;
    // Ble characteristics
    std::unordered_map<std::string, BLECharacteristic*> mCharacteristicTable;
    
  public:
    BleSamplerManager();
    // Ble Server
    void ServiceSetup(std::string tUuid);
    void NewCharacteristic(std::string uuid, uint32_t properties);
    void SetCharacteristic(std::string uuid, std::string value);
    void ServiceStart();
    // Gateway
    bool SubscribeToMaster();
    bool IsConnected();
  
  private:
    class BleServerCallback;
};

#endif
