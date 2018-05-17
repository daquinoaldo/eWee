#ifndef sensor_manager_H
#define sensor_manager_H

#include "DHTesp.h"

class SensorManager {
  private:
    int PIR_PIN;
    int DHT_PIN;
    int RS_PIN;
    int TEMT_PIN;
    int MQ135_PIN;
    int MQ3_PIN;
    
  public:
    /*
     * Constructor
     */
    SensorManager();

    /*
     * Setup
     * to be called in the setup function of the Arduino sketch
     */
    void setup(int PIR_PIN, int DHT_PIN, int RS_PIN, int TEMT_PIN, int MQ135_PIN, int MQ3_PIN);

    /*
     * Get movement information from PIR
     * @return 1 if there is movement, 0 otherwise
     */
    int getPIR();

    /*
     * Get temperature from DHT22
     * Uses the DHTesp.h library
     * @return a float value with the temperature in Celsius degrees
     */
    float getTemperature();

    /*
     * Get temperature from DHT22
     * Uses the DHTesp.h library
     * @return a float value with the humidity in percentage
     */
    float getHumidity();

    /*
     * Get door information from the reed switch
     * @return 1 if the door is open, 0 otherwise
     */
    int getReedSwitch();

    /*
     * Get light intensity from the TEMT6000 sensor
     * @return a float value with the light in percentage
     */
    float getLight();

    /*
     * Get information about the quality of the air
     * @return ?
     */
    float getMQ135();

    /*
     * Get bhutan presence in the house
     * @return ?
     */
    float getMQ3();
};

#endif
