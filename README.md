# eWee
_Ensuring Wellness with Energy Efficiency_
  
A group project for the Mobile and Cyber-Physical Systems course at University of Pisa.  
For more information check our [introduction file](introducing-eWee.pdf) or the [poster](poster.pdf).
## Installation
### On Raspberry Pi
`cd /opt`  
`curl https://raw.githubusercontent.com/daquinoaldo/eWee/master/install-raspberry.sh | sudo bash`
### Prepare devices (ESP32)
Download the [Arduino IDE](https://www.arduino.cc/en/Main/Software) and the [ESP32 Tools](https://github.com/espressif/arduino-esp32#installation-instructions)  
In the project folder navigate into network > esp-32. You have to open the sampler.ino and the actuator.ino files (inside the homonym folders) and flash the ESP32.  
