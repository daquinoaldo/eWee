#include <string>

#include "lib/misc.h"
#include  "ble-gateway.h"

#include <BLEDevice.h>
#include <BLEServer.h>
#include <BLEUtils.h>
#include <BLE2902.h>


// ----- ----- GLOBALS ----- ----- //
std::string gGatewayUUID;
int gHarvestRate = 1000;
SampleTraker* s;


// ----- ----- SETUP ----- ----- //
void setup() {
  Serial.begin(115200);
  srand (time(NULL));
  
  // uuid set
  char uuid[5];
  gen_id(uuid, 5);
  std::string gGatewayUUID = "gateway_" + std::string(uuid);
  
  Serial.println(gGatewayUUID.c_str());
  s = new SampleTraker(gGatewayUUID);
  s->InitSubService();
}


// ----- ----- MAIN ----- ----- //
void loop() {
  s->Sample();

  delay(5000);
}


