#include <string>
#include <time.h> 

#include "lib/misc.h"
#include "ble-sampler.h"

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>


// ----- ----- SAMPLER UUIDs ----- ----- //
#define SENSING_SERVICE_UUID (BLEUUID((uint16_t)0x181A)).toString()
#define TEMP_UUID            (BLEUUID((uint16_t)0x2A1F)).toString()
#define LAST_MOD_UUID        (BLEUUID((uint16_t)0x2AC2)).toString()
#define MASTER_ID_UUID       (BLEUUID((uint16_t)0x2AC3)).toString()
#define ILLUMINATION_UUID    (BLEUUID((uint16_t)0x2AC4)).toString()
#define MOVMENT_UUID         (BLEUUID((uint16_t)0x2AC5)).toString()


// ----- ----- GLOBALS ----- ----- //
std::string gSamplerUUID;
BleSamplerManager aus;


// ----- ----- SETUP ----- ----- //
void setup() {
  Serial.begin(115200);
  srand (time(NULL));
  
  // uuid set
  char uuid[5];
  gen_id(uuid, 5);
  std::string gSamplerUUID = "sampler_" + std::string(uuid);

  // BLE service initialization
  BLEDevice::init(gSamplerUUID);
  aus.ServiceSetup(SENSING_SERVICE_UUID);
  aus.NewCharacteristic(TEMP_UUID, BLECharacteristic::PROPERTY_READ);
  aus.ServiceStart();
  aus.FindMaster();
}


// ----- ----- MAIN ----- ----- //
void loop() {
  static bool gotMaster = false;
  if(!gotMaster) 
  {
    Serial.println("Attempting to connect");
    gotMaster = aus.SubscribeToMaster();
    if(gotMaster) Serial.println("Connected to master");
  }
  
  sampleCycle();
  delay(1000);
}


// ----- ----- SAMPLER ----- ----- //
void sampleCycle() {
  std::string sampledTemp = int2string(random(30));
  aus.SetCharacteristic(TEMP_UUID, sampledTemp);
}