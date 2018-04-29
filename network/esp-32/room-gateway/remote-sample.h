#ifndef remotesample_H
#define remotesample_H

#include <string>

#include "BLEDevice.h"
#include "BLEScan.h"

// ----- ----- SAMPLER UUIDs ----- ----- //
#define SENSING_SERVICE_UUID (BLEUUID((uint16_t)0x181A)).toString()
#define TEMP_UUID            (BLEUUID((uint16_t)0x2A1F)).toString()
#define LAST_MOD_UUID        (BLEUUID((uint16_t)0x2AC2)).toString()
#define MASTER_ID_UUID       (BLEUUID((uint16_t)0x2AC3)).toString()
#define ILLUMINATION_UUID    (BLEUUID((uint16_t)0x2AC4)).toString()
#define MOVMENT_UUID         (BLEUUID((uint16_t)0x2AC5)).toString()

class RemoteSample 
{
  BLEAddress* mBleAddress;
  
  
  public:
    RemoteSample(std::string mac);
    bool GetSample(BLEClient* client, std::string* res);
  
  private:
    bool ConnectToServer();
};

#endif
