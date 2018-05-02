#include <string>
#include <time.h> 

#include "ble-sampler.h"

#include <sstream>
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
BleSamplerManager aus;


// ----- ----- SETUP ----- ----- //
void setup() {
  Serial.begin(115200);
  srand (time(NULL));
  
  // Setting up ble device UUID
  char uuid[5];
  rndStr(uuid, 5);
  std::string samplerUUID = "sampler_" + std::string(uuid);

  // BLE device initialization
  BLEDevice::init(samplerUUID);
  // Setting up a new sensing service
  aus.ServiceSetup(SENSING_SERVICE_UUID);
  // Creating new characteristic
  aus.NewCharacteristic(TEMP_UUID, BLECharacteristic::PROPERTY_READ);
  // Starting the server
  aus.ServiceStart();
}


// ----- ----- MAIN LOOP ----- ----- //
void loop() {
  sampleCycle();
  delay(1000);
}


// ----- ----- SAMPLER ----- ----- //
/*
 * Get sensing data and update the characteristics
 */
void sampleCycle() {
  std::string sampledTemp = long2string(random(30));
  aus.SetCharacteristic(TEMP_UUID, sampledTemp);
}


// ----- ----- MISCELLANEOUS ----- ----- //
/*
 * Generates a random string of len characters and stores it in s
 */
void rndStr(char *s, const int len) {
    static const char alphanum[] =
        "0123456789"
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
        "abcdefghijklmnopqrstuvwxyz";
    for (int i = 0; i < len; ++i) {
        s[i] = alphanum[random(9999) % (sizeof(alphanum) - 1)];
    }
    s[len] = 0;
}

/*
 * Converts a long into a string
 */
std::string long2string(long tValue) {
  std::ostringstream convert;
  convert << tValue;
  return convert.str();
}
