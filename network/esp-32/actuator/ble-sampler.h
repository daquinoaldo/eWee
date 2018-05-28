#ifndef samplerble_H
#define samplerble_H

#include <string>
#include <unordered_map>

#include "BLEDevice.h"
#include "BLEScan.h"


class BleSamplerManager
{
  private:
    // Ble main values
    BLEServer  *mBleServer;
    BLEService *mEnvirService;
    // Ble characteristics map
    std::unordered_map<std::string, BLECharacteristic*> mCharacteristicTable;
    
  public:
    BleSamplerManager();
    /* 
     *  Set up a new service with uuid 'tUuid' 
     *  @param tuuid: the service uuid
     */
    void ServiceSetup(std::string tuuid);
    /* 
     * Add a new characteristic to the last added service
     * @param tuuid: the new characteristic uuid
     * @param tProperties: the read write characteristic's properties
     */
    void NewCharacteristic(std::string uuid, uint32_t properties);
    /*
     * Set the characteristic's value with uuid==tuuid
     * @param tuuid: the target characteristic uuid
     * @param tValue: the new value
     */
    bool SetCharacteristic(std::string uuid, std::string value);
    /*
     * Get the characteristic's value with uuid==tuuid
     * @param tuuid: the target characteristic uuid
     * @param tValue: the new value
     */
    std::string GetCharacteristic(std::string tuuid);
    /*
     * Starts a new server containing the given service with the given characteristics
     */
    void ServiceStart();
};

#endif
