#include "ble-gateway.h"
#include "remote-sample.h"

#include <string>
#include <unordered_map>
#include <HardwareSerial.h>

#include <BLEAddress.h>
#include "BLEDevice.h"
#include "BLEScan.h"

#define MAX_SAMPLE_FAILS 1

// ----- ----- BLE NEW SUBSCRIPTION ----- ----- //
class SampleTraker::Subscription: public BLECharacteristicCallbacks {
  std::unordered_map<std::string, RemoteSample*>* mAddresses;
  
  public:
    Subscription(std::unordered_map<std::string, RemoteSample*>* tAddresses): BLECharacteristicCallbacks()
    {
      mAddresses = tAddresses;
    }
  
  void onWrite(BLECharacteristic* pCharacteristic) {
    std::string samplerMac = pCharacteristic->getValue();
    if (mAddresses->find(samplerMac) != mAddresses->end()) return; // Already subscribed

    RemoteSample* rsample = new RemoteSample(samplerMac);
    mAddresses->emplace(samplerMac, rsample);    
    Serial.println(("new Subscription: " + samplerMac).c_str());
  } 
};


SampleTraker::SampleTraker(std::string tUuid) 
{
  BLEDevice::init(tUuid);
  mClient = BLEDevice::createClient();
  mServer = BLEDevice::createServer();
}


// ----- ----- BLE SETUP ----- ----- //
void SampleTraker::InitSubService()
{
  // BLE service initialization
  BLEService *pService = mServer->createService(SERVICE_UUID);

  // BLE characteristic setup
  BLECharacteristic *subscription = pService->createCharacteristic(SUBSCRIBE_UUID, BLECharacteristic::PROPERTY_WRITE);
  subscription->setCallbacks(new Subscription(&mSamplersAddresses));
  
  // Starting the service
  pService->start();
  BLEAdvertising *pAdvertising = mServer->getAdvertising();
  pAdvertising->addServiceUUID(pService->getUUID());
  pAdvertising->start();
}


// ----- ----- MEASUREMENT GATHERING ----- ----- //
std::unordered_map<std::string, std::string> SampleTraker::Sample()
{
  Serial.println("Registered sampler:");
  for(auto i : mSamplersAddresses) {
    // Printing mac address
    std::string blemac = i.first;
    Serial.println(blemac.c_str());
    // Retrieving data
    std::string sampleData;
    RemoteSample* remoteS = i.second;
    bool success = remoteS->GetSample(mClient, &sampleData);
    // Handling success/fails
    if(success) Serial.println(sampleData.c_str());
    else { mSamplersAddresses.erase(blemac); delete remoteS; }
  }
  
  Serial.println("");
  return {};
}

