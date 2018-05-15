#include <WiFi.h>
#include "BLEScan.h"
#include "BLEDevice.h"
#include "BLEAdvertisedDevice.h"

const char* ssid     = "your-ssid";
const char* password = "your-password";

const char * udpAddress = "255.255.255.255";
const int udpPort = 3333;

class MyAdvertisedDeviceCallbacks: public BLEAdvertisedDeviceCallbacks {
  void onResult(BLEAdvertisedDevice advertisedDevice) {
    Serial.println("Advertised Device: "+String(advertisedDevice.toString().c_str()));
  }
};

void setup() {
  Serial.begin(115200);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
}

void loop() {
  Serial.println("Scanning sample starting");
  BLEDevice::init("");
  BLEScan* pBLEScan = BLEDevice::getScan();
  pBLEScan->setAdvertisedDeviceCallbacks(new MyAdvertisedDeviceCallbacks());
  pBLEScan->setActiveScan(true);
  BLEScanResults scanResults = pBLEScan->start(10);
  Serial.println("We found "+String(scanResults.getCount())+" devices");
  scanResults.dump();
  Serial.println("Scanning sample ended");
}
