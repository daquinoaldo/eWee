#include "remote-sample.h"

#include <string>
#include <HardwareSerial.h>

#include "BLEDevice.h"
#include "BLEScan.h"
#include <BLEClient.h>

class RemoteSample::ClientCallback: public BLEClientCallbacks {
  bool* mIsconnected;
  
  public:
    ClientCallback(bool* tIsconnected): BLEClientCallbacks() {
      mIsconnected = tIsconnected;
    }
    
  void onConnect(BLEClient *pClient){
    *mIsconnected=true;
  }

  void onDisconnect(BLEClient *pClient){
    Serial.println("Disconnected");
    *mIsconnected=false;
  }
};


RemoteSample::RemoteSample (std::string mac) 
{
  mBleAddress = new BLEAddress(mac);
}

RemoteSample::~RemoteSample () 
{
  delete mBleAddress;
  if(mClient!=NULL) {
    if(mClient->isConnected()) mClient->disconnect(); 
    delete mClient;
  }
}

int RemoteSample::GetFails() { return mfails; }

bool RemoteSample::GetSample(std::string* res)
{
  static BLERemoteService* sensingService;
  static BLERemoteCharacteristic* tempRemoteChar;
  
  // If fs time need to connect
  if (mClient==NULL || !mClient->isConnected()) 
  { 
    Serial.println("Trying to connect...");

    if(mClient!=NULL) {
      mClient->disconnect(); 
      delete mClient; // Cleaning environment if needed
    }
    mClient = BLEDevice::createClient();
    
    bool succ = mClient->connect(*mBleAddress);
    if (!succ) { mfails++; return false; }
    else Serial.println("Connected");

    sensingService = mClient->getService(SENSING_SERVICE_UUID);
    if (sensingService == NULL) { mfails++; return false; }

    tempRemoteChar = sensingService->getCharacteristic(TEMP_UUID);
  }

  if (tempRemoteChar == NULL) { mfails++; return false; }
  std::string value = tempRemoteChar->readValue();
  
  if(!mClient->isConnected()) { mfails++; return false; } 
  else *res = ("Temperature: " + value);

  mfails = 0;
  return true;
}
