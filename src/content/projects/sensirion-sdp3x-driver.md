---
title: 'Sensirion SDP3x Arduino Driver'
pubDate: 2017-02-04
description: "Arduino library for interfacing with the Sensirion SDP3x differential pressure sensor over I2C."
author: "Michel Racic"
category: "library"
tags: ["arduino","makezurich","sensor","library","i2c","pressure"]
heroImage: '/images/projects/sdp3x-hero.svg'
repo: 'https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver'
aliases: ["/libs/sensirion-sdp3x-driver"]
---

This Arduino library can be used to interface the [SDP3x](https://www.sensirion.com/products/differential-pressure-sensors/worlds-smallest-differential-pressure-sensor/) differential pressure sensor from [Sensirion](https://www.sensirion.com) over I2C to get the pressure difference and the temperature reading it exposes.

<!--more-->

# Installation
For now clone the [github repository](https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver) or download and unpack a [Zipped version](https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver/archive/master.zip) into the libraries folder of your Arduino IDE.

```sh
git clone https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver.git
```

# Usage example
```c
// To set a different I2C address, uncomment the define
// #define SDP3x_I2C_ADDRESS 0x21
#include "SDP3x.h"

// Setup routine runs once when you press reset
void setup() {
	// Initialize serial console
	Serial.begin(9600);
	// Initialize I2C communication
	Wire.begin();
}

// the loop routine runs over and over again forever
void loop() {
	// Simply print raw value, this can be viewed in the serial plotter
	Serial.print("Pressure difference: ")
	Serial.println(SDP3x.getPressureDiff());
	// delay for a 100ms until the next sensor reading
	delay(100);
	Serial.print("Temperature: ")
	Serial.println(SDP3x.getTemperature());
	// delay for a 100ms until the next sensor reading
	delay(100);
}
```


# Sourcecode

https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver
