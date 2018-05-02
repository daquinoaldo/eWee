#include <WiFi.h>
#include <WiFiUdp.h>

#include <BLEDevice.h>



// ----- ----- COSTANTS ----- ----- //
#define SCAN_TIME 2


// ----- ----- GLOBALS ----- ----- //
BLEScan* gBLEScan;
const char* ssid     = "your-ssid";
const char* password = "your-password";

const char * udpAddress = "255.255.255.255";
const int udpPort = 3333;

WiFiUDP udp;

// ----- ----- FUNCTIONS DECLARATIONS ----- ----- //
void handleSensingData(std::string macAddr, std::string sdata);


// ----- ----- SET UP ----- ----- //
void setup() {
  Serial.begin(115200);

  BLEDevice::init("");
  gBLEScan = BLEDevice::getScan(); //create new scan
  gBLEScan->setActiveScan(true); //active scan uses more power, but get results faster

  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
      delay(500);
      Serial.print(".");
  }
}


// ----- ----- MAIN LOOP ----- ----- //
void loop() {
  // Scan for scanTime
  BLEScanResults foundDevices = gBLEScan->start(SCAN_TIME);
  for(int i=0; i<foundDevices.getCount(); i++) {
    BLEAdvertisedDevice dev = foundDevices.getDevice(i);
    /*std::string devMac = dev.getAddress().toString();
    std::string devName = dev.getName();
    */
    std::string devName = "abc";
    if(devName.substr(0, 2) == "**") {
      //handleSensingData(devMac, devName.substr(2, devName.length())); 
    } // true iff the beacon comes from a sampler
  }
}


// ----- ----- FUNCTION IMPLEMENTATION ----- ----- //
/*
 * Takes as argument a mac address and the string containing 
 * the sampled data and send it to the master head
 */
void handleSensingData(std::string macAddr, std::string sdata) {
  // Preparing data
  /*
  std::stringstream ss;
  ss << macAddr << " -> " << sdata;
  std::string sampleData = ss.str();
  */
  
  // Building packet
  int dataLen = sampleData.length()+1;
  const uint8_t* pData = reinterpret_cast<const uint8_t*>(sampleData.c_str());

  // Sending packet
  udp.beginPacket(udpAddress, udpPort);
  udp.write("282", 4);
  udp.endPacket();
}

