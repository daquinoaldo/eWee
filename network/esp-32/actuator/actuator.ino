#include <string>
#include <time.h>

#include "ble-sampler.h"

#include <sstream>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>


// ----- ----- SAMPLER UUIDs ----- ----- //
#define SENSING_SERVICE_UUID (BLEUUID((uint16_t)0x181A)).toString()
#define BLINKING_UUID        (BLEUUID((uint16_t)0x0003)).toString() //TODO: ???
#define SWITCH_UUID          (BLEUUID((uint16_t)0x0002)).toString() //TODO: ???

#define LED_BUILTIN 2


// ----- ----- PIN CONFIGURATIONS ----- ----- //
// Do NOT use pin 2
#define SWITCH_PIN 33

#define DEVICE_NAME "actuator"


// ----- ----- GLOBALS ----- ----- //
BleSamplerManager ble;
bool isInternalBlinking = false;


// ----- ----- SETUP ----- ----- //
#ifndef SWITCH_PIN
#define SWITCH_PIN -1
#endif

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
  ble.NewCharacteristic(BLINKING_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE);
  ble.NewCharacteristic(SWITCH_UUID, BLECharacteristic::PROPERTY_READ | BLECharacteristic::PROPERTY_WRITE);
  ble.SetCharacteristic(SWITCH_UUID, "off");
  // Starting the server
  ble.ServiceStart();

  // Setup leds
  pinMode(LED_BUILTIN, OUTPUT);
  pinMode(SWITCH_PIN, OUTPUT);
}


// ----- ----- MAIN LOOP ----- ----- //
void loop() {

  // Switch
  std::string switch_status = ble.GetCharacteristic(SWITCH_UUID);
  if (switch_status.compare("off") != 0) {
    digitalWrite(SWITCH_PIN, LOW);
    Serial.println("Switch on");
  }
  else {
    digitalWrite(SWITCH_PIN, HIGH);
    Serial.println("Switch off");
  }


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
