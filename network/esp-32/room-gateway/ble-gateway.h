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
    BLEServer *mServer;
    BLEClient *mClient; 
    std::unordered_map<std::string, int> mCharacteristicTable;
    std::unordered_map<std::string, RemoteSample*> mSamplersAddresses;
    
  public:
    SampleTraker(std::string tUuid);
    void InitSubService();
    std::set<BLEAddress> GetAddresses();
    std::unordered_map<std::string, std::string> Sample();

  private:
    class Subscription;
};

#endif
