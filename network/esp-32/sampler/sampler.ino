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
#define GAS_UUID             (BLEUUID((uint16_t)0x0002)).toString() //TODO: ???
#define BLINKING_UUID        (BLEUUID((uint16_t)0x0003)).toString() //TODO: ???

// Do NOT use pin 2
#define PIR_PIN -1
#define DHT_PIN -1 // 18
#define RS_PIN  -1 // 4
#define TEMT_PIN -1//23
#define MQ135_PIN -1//19
#define MQ3_PIN -1//5

#define LED_BUILTIN 2

#define DEVICE_NAME "corridor"


// ----- ----- GLOBALS ----- ----- //
BleSamplerManager ble;
SensorManager sensors;
bool isInternalBlinking = false;


// ----- ----- SETUP ----- ----- //
void setup() {
  Serial.begin(115200);
  srand (time(NULL));

  // Setting up ble device UUID
  char uuid[5];
  rndStr(uuid, 5);
  std::string samplerUUID = "sampler_" + std::string(DEVICE_NAME);//std::string(uuid);

  // BLE device initialization
  BLEDevice::init(samplerUUID);
  // Setting up a new sensing service
  ble.ServiceSetup(SENSING_SERVICE_UUID);
  // Creating new characteristic
  if(PIR_PIN > 0) ble.NewCharacteristic(MOVEMENT_UUID, BLECharacteristic::PROPERTY_READ);
  if(DHT_PIN > 0) ble.NewCharacteristic(TEMP_UUID, BLECharacteristic::PROPERTY_READ);
  if(DHT_PIN > 0) ble.NewCharacteristic(HUMID_UUID, BLECharacteristic::PROPERTY_READ);
  if(RS_PIN > 0) ble.NewCharacteristic(DOOR_UUID, BLECharacteristic::PROPERTY_READ);
  if(TEMT_PIN > 0) ble.NewCharacteristic(ILLUMINATION_UUID, BLECharacteristic::PROPERTY_READ);
  if(MQ135_PIN > 0) ble.NewCharacteristic(AIR_UUID, BLECharacteristic::PROPERTY_READ);
  if(MQ3_PIN > 0) ble.NewCharacteristic(GAS_UUID, BLECharacteristic::PROPERTY_READ);
  ble.NewCharacteristic(BLINKING_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE);
  // Starting the server
  ble.ServiceStart();

  // Setup the sensors
  // sensors.setup(PIR_PIN, DHT_PIN, RS_PIN, TEMT_PIN, MQ135_PIN, MQ3_PIN);
  // Setup builtin led
  pinMode(LED_BUILTIN, OUTPUT);
}


// ----- ----- MAIN LOOP ----- ----- //
void loop() {
  // Get sensing data and update the characteristics
  if(PIR_PIN > 0) ble.SetCharacteristic(MOVEMENT_UUID, int2string(sensors.getPIR()));
  if(DHT_PIN > 0) ble.SetCharacteristic(TEMP_UUID, float2string(sensors.getTemperature()));
  if(DHT_PIN > 0) ble.SetCharacteristic(HUMID_UUID, float2string(sensors.getHumidity()));
  if(RS_PIN > 0)  ble.SetCharacteristic(DOOR_UUID, int2string(sensors.getReedSwitch()));
  if(TEMT_PIN > 0) ble.SetCharacteristic(ILLUMINATION_UUID, float2string(sensors.getLight()));
  if(MQ135_PIN > 0) ble.SetCharacteristic(AIR_UUID, float2string(sensors.getMQ135()));
  if(MQ3_PIN > 0) ble.SetCharacteristic(GAS_UUID, float2string(sensors.getMQ3()));

  // Blinking logic
  std::string blinking = ble.GetCharacteristic(BLINKING_UUID);
  if (blinking.compare("off") != 0) {
    blinkInternal();
    ble.SetCharacteristic(BLINKING_UUID, "off");
  }
  delay(1000);
}


// ----- ----- BLINKING TASK ----- ----- //
void blinkInternal() {
  // We're already blinking
  if (isInternalBlinking) return;
  // If not blinking, then start new rtos task
  isInternalBlinking = true;
  xTaskCreate(blinktask, "TaskOne", 10000, NULL,  1, NULL);
}

void blinktask(void* args) {
  for(int i=0; i<3; i++) {
    digitalWrite(LED_BUILTIN, HIGH);
    delay(500);
    digitalWrite(LED_BUILTIN, LOW);
    delay(500);
  }
  isInternalBlinking = false;
  vTaskDelete( NULL );
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
