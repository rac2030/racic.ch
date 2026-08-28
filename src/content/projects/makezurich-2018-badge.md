---
title: "MakeZurich 2018 Badge"
pubDate: 2018-05-27
description: "IoT conference badge with e-Paper display, Sensirion sensors, and WiFi connectivity, designed and built for the MakeZurich vol. II hackathon."
author: "Michel Racic"
category: "hackathon"
tags: []
heroImage: /images/projects/messydesk.jpg
aliases: ["/mz18/", "/project/MakeZurich-18-badge"]
---

You received your [MakeZurich vol. II](https://makezurich.ch) participants badge and want to know more about it?

For now, documentation was pretty rare as we worked day and night to get you the badge assembled and the firmware up and running just in time.

## Main Functionality

As a badge should do what a badge needs to do, it will display your name in the first place. And don't worry if you run out of battery — as we used an e-Paper display, the last screen will stay. You could connect a serial programmer or just 3.3V to it, wait until it's on the name view and then just cut the power and we will still see who you are.

### Name View

![Name view](/images/projects/makezurich-18-badge/nameView.jpg)

This is the standard view which gets loaded once your name has been registered and it did connect to the Kraftwerk wifi to fetch the details from the server.

### QR Initialisation View

![QR view](/images/projects/makezurich-18-badge/qrView.jpg)

When the badge is not yet registered, this view will be shown until it fetches a name from the server. Press SW1 (button on the lower left) to get to this view again. Whenever you go to that view, it will startup wifi, connect to Kraftwerk and fetch the name from the server and update it.

### Sensor View

![Sensor view](/images/projects/makezurich-18-badge/sensorView.jpg)

The sensor module has an SHTC3 Temperature and Humidity sensor as well as an SGPC3 Gas sensor sponsored from [Sensirion](https://www.sensirion.com) on board. This view displays the current data and refreshes itself every 5 seconds.

### E.T. Calling Home

Yes we collect some data — specifically we send back the current sensor readings every 30 minutes to our server for an experiment. Payload is being dumped as well as the responses.

## Your Turn

You can hack that badge! You can use the NINA module in your own project as well as the EPD as they both are not soldered. The sensor module can be used too — you only need to desolder it from the badge first.

### Buttons

You have 4 buttons available. See [buttonWithInterrupt.ino](https://github.com/rac2030/IoT-conference-badge/blob/firmware/firmware/examples/ButtonWithInterrupt/buttonWithInterrupt.ino) for an example.

### E-Paper Display

Take a look at the [GxEPD test example](https://github.com/rac2030/IoT-conference-badge/tree/firmware/firmware/examples/GxEPD_SPI_TestExample_NINA) to see how to use it with the GxEPD library.

### LEDs

You have 4 WS2812b addressable LEDs on the badge. Find an example using the FastLED library in [LED-Siren.ino](https://github.com/rac2030/IoT-conference-badge/blob/firmware/firmware/examples/LED-Siren/LED-Siren.ino).

### Sensor Module

I adapted the Arduino library from Sensirion's GitHub for the sensor module — see the [SGPC3 demo](https://github.com/rac2030/IoT-conference-badge/tree/firmware/firmware/examples/SGPC3-demo) project.

### I2C Devices

You have 2 I2C buses on the NINA. See [i2c_scanner.ino](https://github.com/rac2030/IoT-conference-badge/blob/firmware/firmware/examples/i2c_scanner/i2c_scanner.ino) for an example.

## PCB Layout

Here is a rendering of the backside:

![Badge back render](/images/projects/makezurich-18-badge/badgebackrender.png)

## Sources

- [Firmware (branch)](https://github.com/rac2030/IoT-conference-badge/tree/firmware/firmware)
- [KiCAD hardware design](https://github.com/rac2030/IoT-conference-badge/tree/master/hardware)
- [badge-mainboard-rev.0.3.7.pdf](https://github.com/rac2030/IoT-conference-badge/blob/master/hardware/badge-mainboard-rev.0.3.7.pdf)
- [sensors-module-board-rev.0.1.0.pdf](https://github.com/rac2030/IoT-conference-badge/blob/master/hardware/sensors-module-board-rev.0.1.0.pdf)

## Team Contributions

This board was reviewed and challenged by various people during the design phase. Thanks to:

Benjamin Marty, Dirk Zugenmaier, Gonzalo Casas, Matthias Schibli, Michael Ammann, Oliver Walkhoff, Tillo Bosshart, Urs Marti, and [Tony Kümin](http://kumin.ch).
