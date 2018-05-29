#include <string>
#include <time.h>

#include "ble-sampler.h"

#include <sstream>
#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEServer.h>


// ----- ----- SAMPLER UUIDs ----- ----- //
#define SENSING_SERVICE_UUID (BLEUUID((uint16_t)0x181A)).toString()

// Actuators
#define BLINKING_UUID        (BLEUUID((uint16_t)0xA000)).toString() //Custom: (internal) led blinking
#define SWITCH_UUID          (BLEUUID((uint16_t)0xA001)).toString() //Custom: relay

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

  // Device name
  std::string samplerUUID = "sampler_" + std::string(DEVICE_NAME);

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



// ----- ----- AUXILIAR FUNCTIONS ----- ----- //
// Converts values into strings

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