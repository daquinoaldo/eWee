#ifndef gatewayble_H
#define gatewayble_H

#include "remote-sample.h"

#include <set>
#include <unordered_map>

#include "BLEDevice.h"

// ----- ----- GATEWAY UUIDs ----- ----- //
#define SERVICE_UUID   (BLEUUID((uint16_t)0x180A)).toString()
#define SUBSCRIBE_UUID (BLEUUID((uint16_t)0x8888)).toString()

class SampleTraker 
{
  private: 
    std::unordered_map<std::string, int> mCharacteristicTable;
    std::unordered_map<std::string, RemoteSample*> mSamplersAddresses;
    
  public:
    SampleTraker();
    void InitSubService(std::string tUuid);
    std::set<BLEAddress> GetAddresses();
    std::unordered_map<std::string, std::string> Sample();

  private:
    class Subscription;
};

#endif
