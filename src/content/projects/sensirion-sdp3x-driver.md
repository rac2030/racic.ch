---
title: 'Sensirion SDP3x Arduino Driver'
pubDate: 2017-02-04
description: "Arduino library for interfacing with the Sensirion SDP3x differential pressure sensor over I2C."
author: "Michel Racic"
category: "library"
tags: ["arduino", "sensor"]
heroImage: '/images/projects/sdp3x-hero.svg'
repo: 'https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver'
aliases: ["/libs/sensirion-sdp3x-driver"]
---

This Arduino library can be used to interface the [SDP3x](https://www.sensirion.com/products/differential-pressure-sensors/worlds-smallest-differential-pressure-sensor/) differential pressure sensor from [Sensirion](https://www.sensirion.com) over I2C to get the pressure difference and the temperature reading it exposes.

## Installation

Clone the [GitHub repository](https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver) or download a [zipped version](https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver/archive/master.zip) into the libraries folder of your Arduino IDE.

```bash
git clone https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver.git
```

## Usage Example

```cpp
// To set a different I2C address, uncomment the define
// #define SDP3x_I2C_ADDRESS 0x21
#include "SDP3x.h"

void setup() {
  Serial.begin(9600);
  Wire.begin();
}

void loop() {
  Serial.print("Pressure difference: ");
  Serial.println(SDP3x.getPressureDiff());
  delay(100);
  Serial.print("Temperature: ");
  Serial.println(SDP3x.getTemperature());
  delay(100);
}
```

## Source Code

[https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver](https://github.com/rac2030/Arduino-Sensirion-SDP3x-driver)
