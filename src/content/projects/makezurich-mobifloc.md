---
title: "MakeZurich — MoBiFloC"
pubDate: 2017-02-04
description: "A cheap and portable bike commuter flow counter node to enhance the existing sensor network."
category: "hackathon"
tags: ["arduino", "hackathon", "lorawan"]
heroImage: /images/projects/MakeZurich-logo.png
---

Project entry for the [MakeZurich](https://makezurich.ch) 2017 Hackathon.

A cheap and portable bike commuter flow counter node to enhance the existing sensor network. This will also be helpful to quickly bring up nodes at the right place to evaluate new routes and how they are used.

## Challenge

- An existing loop counter costs CHF 5000 (sensor + installation).
- Each loop counter consists of two loops to detect direction of travel.
- Sensors use SIM cards and work reliably.
- Robert Dorbritz, responsible for slow traffic in Zürich, is mainly interested how bicycle usage develops over time.
- Understanding cyclist behavior in different weather conditions is also interesting.
- Where is the largest influx of cyclists entering the city?

## Idea

Create a measuring unit that is cheap and can be deployed to where it's needed to enrich the existing data. We wanted to use the existing [LoRaWAN infrastructure from TTN Zürich](https://www.thethingsnetwork.org/community/zurich/).

After a week of research and tryouts in the [MechArtLab](http://www.mechatronicart.ch/mechartlab/), I picked up on the idea of using a differential pressure sensor for this.

We wanted to use 2 differential pressure sensors with one tube each, allowing us not only to count but also determine the direction of bicycles passing over the sensor. We planned to distinguish pedestrians from bicycles by calculating the difference in speed between the two tubes or the intensity of the pressure change.

For environmental data, we used the SHT31 from Sensirion to collect temperature and humidity. As a bonus, we considered having a button for initialization — the uBlox GPS would then transmit the current GPS position.

## Used Hardware

From the MakeZurich kit (Box #3):

- Arduino Pro Mini 3.3V (8MHz)
- [Microchip RN2483 LoRaWAN modem](https://github.com/rac2030/MakeZurich/wiki/Hello-Lora-with-Arduino-Pro-mini-and-Microchip-RN2483)
- [GPS uBlox PAM 7Q](https://github.com/rac2030/MakeZurich/wiki/ublox-PAM-7Q-%28GPS%29)

From [Sensirion](https://www.sensirion.com):

- [SHT31 — Temperature and humidity sensor](https://github.com/rac2030/MakeZurich/wiki/SHT31)
- [SDP610 — Differential pressure sensor](https://github.com/rac2030/MakeZurich/wiki/SDP610-%28Differential-pressure-sensor%29)
- [SDP3x — Differential pressure sensor](/projects/sensirion-sdp3x-driver)

## Team

The team was formed on the MakeZurich slack channel and [Tony Kümin](http://kumin.ch) joined [Michel Racic](http://racic.ch) for implementing the idea.

## Development

During the OpenLab week before, I already tested most of the sensors and got the LoRaWAN communication working. We started connecting all the sensors on the breadboard along with wiring it such that we could start tinkering on the software side.

Each wheel generates 2 spikes shortly after each other: when the tire compresses the tube, air flows through the sensor, and when the wheel is gone, the reverse happens and the tube sucks in air from outside.

The second differential pressure sensor was tricky — the mountings on the dev board had a very tiny diameter. Matthias from Sensirion brought some very tiny tubes and helped to glue it together. After the hackathon, I extracted the sensor communication code and made it into a library (see [Sensirion SDP3x Arduino driver](/projects/sensirion-sdp3x-driver)).

The data gets collected and sent every 10 minutes over LoRaWAN with a timestamp, count, and temperature data — respecting the available LoRa bandwidth and the allowed air time per device of 15 seconds per day.

## Source Code

The Arduino and the NodeJS WebApplication is available on [GitHub](https://github.com/rac2030/MakeZurich/tree/master/MoBiFloC).
