#include "remote-sample.h"

#include <string>
#include <HardwareSerial.h>

#include "BLEDevice.h"
#include "BLEScan.h"
#include <BLEClient.h>

RemoteSample::RemoteSample (std::string mac) 
{
  mBleAddress = new BLEAddress(mac);
}

bool RemoteSample::GetSample()
{
  
}
