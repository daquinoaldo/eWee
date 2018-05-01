#include "sdkconfig.h"
#include "SimpleBLE.h"
#include "Time.h"
#include "BLEDevice.h"

#include <sstream>


// ----- ----- COSTANTS ----- ----- //
#define ACTIVE_BLE_TIME 1000   // How many milliseconds the beacon is send
#define DEEP_SLEEP_TIME 2      // Inactive time
#define uS_TO_S_FACTOR 1000000 // Conversion factor for micro seconds to seconds


// ----- ----- GLOBALS ----- ----- //
SimpleBLE gBle;      // Global reference to ble device
long gMsgSeqNum = 0; // Number of messages send


// ----- ----- FUNCTIONS DECLARATIONS ----- ----- //
std::string getSensingData();


// ----- ----- SET UP ----- ----- //
void setup() {
  Serial.begin(115200);
  randomSeed(analogRead(0));
  // Configuring deep sleep
  esp_sleep_enable_timer_wakeup(DEEP_SLEEP_TIME * uS_TO_S_FACTOR);
}


// ----- ----- MAIN LOOP ----- ----- //
void loop() {
  // Preparing data
  std::stringstream ss;
  ss << "**" << gMsgSeqNum << "," << getSensingData();
  std::string beaconData = ss.str();
  std::string 
  
  // Trasmitting the beacon for ACTIVE_BLE_TIME milliseconds
  gMsgSeqNum++;
  gBle.begin(beaconData.c_str());
  delay(ACTIVE_BLE_TIME);
  gBle.end();
  
  // Entering deep sleep
  /* Uncomment for deep sleep */
  // esp_deep_sleep_start();
}


// ----- ----- FUNCTION IMPLEMENTATION ----- ----- //
/*
 * Returns a string containing sampled data separated by ,
 */
std::string getSensingData() {
  int tmp = (rand() % 15) + 15; 
  int door = (rand() % 2);
  
  std::stringstream ss;
  ss << "tp:" << tmp << "," << "dr:" << door;
  return ss.str();
}
