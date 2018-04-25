#include "DHTesp.h"

#define PIR_PIN 12
#define DHT_PIN 14
#define RS_PIN 27

DHTesp dht;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200); // Set the serial monitor to 115200 baud
  dht.setup(DHT_PIN);
  Serial.print("PIR on pin ");
  Serial.println(PIR_PIN);
  Serial.print("DHT on pin ");
  Serial.println(DHT_PIN);
  Serial.print("Reed switch on pin ");
  Serial.println(RS_PIN);
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

void loop() {
  // put your main code here, to run repeatedly:
  delay(2000);
  int movement = getPIR();  // 1 = movement
  float temperature = getTemperature();
  float humidity = getHumidity();
  int door = getReedSwitch();  // 1 = open
}
