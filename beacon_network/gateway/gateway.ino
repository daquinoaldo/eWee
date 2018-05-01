/*
   Based on Neil Kolban example for IDF: https://github.com/nkolban/esp32-snippets/blob/master/cpp_utils/tests/BLE%20Tests/SampleScan.cpp
   Ported to Arduino ESP32 by Evandro Copercini
*/

#include <BLEDevice.h>
#include <BLEUtils.h>
#include <BLEScan.h>
#include <BLEAdvertisedDevice.h>

#include <sstream>


// ----- ----- COSTANTS ----- ----- //
#define SCAN_TIME 2;


// ----- ----- GLOBALS ----- ----- //
BLEScan* gBLEScan;


// ----- ----- FUNCTIONS DECLARATIONS ----- ----- //
void handleSensingData(std::string macAddr, std::string sdata);


// ----- ----- SET UP ----- ----- //
void setup() {
  Serial.begin(115200);

  BLEDevice::init("");
  gBLEScan = BLEDevice::getScan(); //create new scan
  gBLEScan->setActiveScan(true); //active scan uses more power, but get results faster
}


// ----- ----- MAIN LOOP ----- ----- //
void loop() {
  // Scan for scanTime
  BLEScanResults foundDevices = pBLEScan->start(scanTime);
  for(int i=0; i<foundDevices.getCount(); i++) {
    BLEAdvertisedDevice dev = foundDevices.getDevice(i);
    std::string devMac = dev.getAddress().toString();
    std::string devName = dev.getName();

    if(devName.substr(0, 2) == "**") {
      handleSensingData(devMac, devName.substr(2, devName.length())); 
    } // true iff the beacon comes from a sampler
  }
}


// ----- ----- FUNCTION IMPLEMENTATION ----- ----- //
/*
 * Takes as argument a mac address and the string containing 
 * the sampled data and send it to the master head
 */
void handleSensingData(std::string macAddr, std::string sdata) {
  std::stringstream ss;
  ss << macAddr << " -> " << sdata;
  std::string sampleData = ss.str();

  Serial.println(sampleData.c_str());
}
