#include "DHTesp.h"
#include "SimpleBLE.h"

#define PIR_PIN 12
#define DHT_PIN 14
#define RS_PIN 27
#define MQ_PIN 26

DHTesp dht;
SimpleBLE ble;

String device_name = "♥";

void setup() {
  Serial.begin(115200); // Set the serial monitor to 115200 baud
  Serial.setDebugOutput(true);
  
  dht.setup(DHT_PIN);
  pinMode(PIR_PIN, INPUT);
  pinMode(RS_PIN, INPUT);
  pinMode(MQ_PIN, INPUT);
  
  Serial.print("PIR on pin ");
  Serial.println(PIR_PIN);
  Serial.print("DHT on pin ");
  Serial.println(DHT_PIN);
  Serial.print("Reed switch on pin ");
  Serial.println(RS_PIN);
  Serial.print("MQ135 on pin ");
  Serial.println(MQ_PIN);
  Serial.println();
}

int getPIR() {
  int pir = digitalRead(PIR_PIN);
  Serial.print("PIR: ");
  Serial.println(pir);
  return pir;
}

float getTemperature(){
  float temperature = dht.getTemperature();
  Serial.print("Temperature: ");
  Serial.println(temperature, 1);
  return temperature;
}

float getHumidity(){
  Serial.print("Humidity: ");
  float humidity = dht.getHumidity();
  Serial.println(humidity, 1);
  return humidity;
}

int getReedSwitch() {
  int rs = digitalRead(RS_PIN);
  Serial.print("Reed switch: ");
  Serial.println(rs);
  return rs;
}

/*int getMQ125(){
  int mq = digitalRead(MQ_PIN);
  Serial.print("MQ125: ");
  Serial.println(mq);
  return mq;
}*/ //DOESN'T WORK YET

void loop() {
  delay(2000);
  
  int movement = getPIR();  // 1 = movement
  float temperature = getTemperature();
  float humidity = getHumidity();
  int door = getReedSwitch();  // 1 = open
  //int air = getMQ125();

  String beaconMsg = device_name+"m"+String(movement)+"t"+String(temperature)+"h"+String(humidity)+"d"+String(door);
  Serial.println(beaconMsg);
  ble.begin(beaconMsg);
}
