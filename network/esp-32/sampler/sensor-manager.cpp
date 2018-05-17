#include "sensor-manager.h"

DHTesp dht;

/*
 * Constructor
 */
SensorManager::SensorManager() { }


/*
 * Setup
 * to be called in the setup function of the Arduino sketch
 */
void SensorManager::setup(int PIR_PIN, int DHT_PIN, int RS_PIN, int TEMT_PIN, int MQ135_PIN, int MQ3_PIN) {
  this->PIR_PIN = PIR_PIN;
  this->DHT_PIN = DHT_PIN;
  this->RS_PIN = RS_PIN;
  this->TEMT_PIN = TEMT_PIN;
  this->MQ135_PIN = MQ135_PIN;
  this->MQ3_PIN = MQ3_PIN;
  pinMode(PIR_PIN, INPUT);
  pinMode(DHT_PIN, INPUT);
  pinMode(RS_PIN, INPUT);
  pinMode(TEMT_PIN, INPUT);
  pinMode(MQ135_PIN, INPUT);
  pinMode(MQ3_PIN, INPUT);
  if(DHT_PIN > 0) dht.setup(DHT_PIN);
}

/*
 * Get movement information from PIR
 * @return 1 if there is movement, 0 otherwise
 */
int SensorManager::getPIR() {
  int pir = digitalRead(PIR_PIN);
  Serial.print("PIR: ");
  Serial.println(pir);
  return pir;
}

/*
 * Get temperature from DHT22
 * Uses the DHTesp.h library
 * @return a float value with the temperature in Celsius degrees
 */
float SensorManager::getTemperature() {
  float temperature = dht.getTemperature();
  Serial.print("Temperature: ");
  Serial.println(temperature, 1);
  return temperature;
}

/*
 * Get temperature from DHT22
 * Uses the DHTesp.h library
 * @return a float value with the humidity in percentage
 */
float SensorManager::getHumidity() {
  Serial.print("Humidity: ");
  float humidity = dht.getHumidity();
  Serial.println(humidity, 1);
  return humidity;
}

/*
 * Get door information from the reed switch
 * @return 1 if the door is open, 0 otherwise
 */
int SensorManager::getReedSwitch() {
  int rs = digitalRead(RS_PIN);
  Serial.print("Reed switch: ");
  Serial.println(rs);
  return rs;
}

/*
 * Get light intensity from the TEMT6000 sensor
 * @return a float value with the light in percentage
 */
float SensorManager::getLight() {
    float light = analogRead(TEMT_PIN);
    light = light / 1023.0;
    light = pow(light, 2.0);
    Serial.print("Light: ");
    Serial.println(light);
    return light;
}

/*
 * Get information about the quality of the air
 * @return ?
 */
float SensorManager::getMQ135() {
  int mq = digitalRead(MQ135_PIN);
  Serial.print("MQ135: ");
  Serial.println(mq);
  return mq;
}

/*
 * Get bhutan presence in the house
 * @return ?
 */
float SensorManager::getMQ3() {
  int mq = digitalRead(MQ3_PIN);
  Serial.print("MQ3: ");
  Serial.println(mq);
  return mq;
}
