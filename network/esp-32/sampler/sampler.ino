#include <string>
#include <time.h> 

#include "ble-sampler.h"

#include <sstream>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>

#include "sensor-manager.h"

// ----- ----- SAMPLER UUIDs ----- ----- //
#define SENSING_SERVICE_UUID (BLEUUID((uint16_t)0x181A)).toString()
#define LAST_MOD_UUID        (BLEUUID((uint16_t)0x2AC2)).toString()
#define MASTER_ID_UUID       (BLEUUID((uint16_t)0x2AC3)).toString()
// Sensors
#define MOVEMENT_UUID        (BLEUUID((uint16_t)0x2AC5)).toString() //TODO: Object Action Control Point?
#define TEMP_UUID            (BLEUUID((uint16_t)0x2A1F)).toString() //Temperature Celsius
#define HUMID_UUID           (BLEUUID((uint16_t)0x2A6F)).toString() //Humidity
#define DOOR_UUID            (BLEUUID((uint16_t)0x0000)).toString() //TODO: ???
#define ILLUMINATION_UUID    (BLEUUID((uint16_t)0x2A77)).toString() //Irradiance
#define AIR_UUID             (BLEUUID((uint16_t)0x0001)).toString() //TODO: ???

#define PIR_PIN 22
#define DHT_PIN 21
#define RS_PIN 19
#define TEMT_PIN 4
#define MQ_PIN 2

// ----- ----- GLOBALS ----- ----- //
BleSamplerManager aus;
SensorManager sensors;


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
  aus.NewCharacteristic(MOVEMENT_UUID, BLECharacteristic::PROPERTY_READ);
  aus.NewCharacteristic(TEMP_UUID, BLECharacteristic::PROPERTY_READ);
  aus.NewCharacteristic(HUMID_UUID, BLECharacteristic::PROPERTY_READ);
  aus.NewCharacteristic(DOOR_UUID, BLECharacteristic::PROPERTY_READ);
  aus.NewCharacteristic(ILLUMINATION_UUID, BLECharacteristic::PROPERTY_READ);
  aus.NewCharacteristic(AIR_UUID, BLECharacteristic::PROPERTY_READ);
  // Starting the server
  aus.ServiceStart();

  // Setup the sensors
  sensors.setup(PIR_PIN, DHT_PIN, RS_PIN, TEMT_PIN, MQ_PIN);
}


// ----- ----- MAIN LOOP ----- ----- //
void loop() {
  // Get sensing data and update the characteristics
  aus.SetCharacteristic(MOVEMENT_UUID, int2string(sensors.getPIR()));
  aus.SetCharacteristic(TEMP_UUID, float2string(sensors.getTemperature()));
  aus.SetCharacteristic(HUMID_UUID, float2string(sensors.getHumidity()));
  aus.SetCharacteristic(DOOR_UUID, int2string(sensors.getReedSwitch()));
  aus.SetCharacteristic(ILLUMINATION_UUID, float2string(sensors.getLight()));
  aus.SetCharacteristic(AIR_UUID, float2string(sensors.getMQ135()));
  delay(1000);
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
 * Converts values into strings
 */
std::string int2string(int tValue) {
  std::ostringstream convert;
  convert << tValue;
  return convert.str();
}

std::string float2string(int tValue) {
  std::ostringstream convert;
  convert << tValue;
  return convert.str();
}
