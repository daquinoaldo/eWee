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
void SensorManager::setup(
    int PIR_PIN, int DHT_PIN, int RS_PIN, adc1_channel_t* TEMT_PIN, int MQ135_PIN, int BUTTON_PIN) {
  this->PIR_PIN = PIR_PIN;
  this->DHT_PIN = DHT_PIN;
  this->RS_PIN = RS_PIN;
  this->TEMT_PIN = TEMT_PIN;
  this->MQ135_PIN = MQ135_PIN;
  this->BUTTON_PIN = BUTTON_PIN;
  if (PIR_PIN >= 0) pinMode(PIR_PIN, INPUT);
  if (DHT_PIN >= 0) {
    pinMode(DHT_PIN, INPUT);
    dht.setup(DHT_PIN);
  }
  if (RS_PIN >= 0) pinMode(RS_PIN, INPUT);
  if (TEMT_PIN != nullptr) {
    pinMode(*TEMT_PIN, INPUT);
    adc1_config_width(ADC_WIDTH_BIT_10);   //Range 0-1023 
    adc1_config_channel_atten(*TEMT_PIN, ADC_ATTEN_DB_11);  //ADC_ATTEN_DB_11 = 0-3,6V
  }
  if (MQ135_PIN >= 0) pinMode(MQ135_PIN, INPUT);
  if (BUTTON_PIN >= 0) pinMode(BUTTON_PIN, INPUT);
}

/*
 * Get movement information from PIR
 * @return 1 if there is movement, 0 otherwise
 */
int SensorManager::getPIR() {
  if (PIR_PIN < 0) {
    Serial.println("E: PIR_PIN not defined.");
    return -1;
  }
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
  if (RS_PIN < 0) {
    Serial.println("E: PIR_PIN not defined.");
    return -1;
  }
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
    if (TEMT_PIN == nullptr) {
      Serial.println("TEMT_PIN not defined");
      return -1;
    }
    /* value from 0 to 1
    float light = adc1_get_raw(*TEMT_PIN);
    light = light / 1023.0;
    light = pow(light, 2.0);*/
    int raw = adc1_get_raw(*TEMT_PIN);
    float volts = raw * 3.0 / 1024.0;
    float amps = volts / 10000.0;  // across 10,000 Ohms
    float microamps = amps * 1000000;
    float lux = microamps * 2.0;
    float light = lux;
    Serial.print("Light: ");
    Serial.println(light);
    return light;
}

/*
 * Get information about the quality of the air
 * @return ?
 */
float SensorManager::getMQ135() {
  if (MQ135_PIN < 0) {
    Serial.println("E: PIR_PIN not defined.");
    return -1;
  }
  int mq = digitalRead(MQ135_PIN);
  Serial.print("MQ135: ");
  Serial.println(mq);
  return mq;
}

/*
 * Get information about the button
 * @return 1 if pressed, else 0
 */
int SensorManager::getButton() {
  if (BUTTON_PIN < 0) {
    Serial.println("E: BUTTON_PIN not defined.");
    return -1;
  }
  int button = digitalRead(BUTTON_PIN);
  Serial.print("Button: ");
  Serial.println(button);
  return button;
}
