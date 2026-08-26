---
title: "MakeZurich — PakMan"
pubDate: 2018-07-02
description: "LoRaWAN-connected delivery box that monitors temperature, humidity, and VOCs, alerting recipients of contamination during medical transport."
category: "hackathon"
tags: ["arduino", "hackathon", "lorawan"]
heroImage: /images/projects/MakeZurich-logo.png
---

Project entry for the [MakeZurich](https://makezurich.ch) 2018 Hackathon. A delivery box which monitors the environment of its content and send an alarm via LoRaWAN in case a threshold breach gets detected.

## Challenge

Due to the fact that the challenge owner was absent all the time, we came up with our own use case.

## Idea

Let's take the use case of hospital transport. A medical transport has to be done between 2 Hospitals or from a supplier to a receiver. The content of the box is sensitive to its environment — in our case temperature, humidity and VOCs (volatile organic compounds).

As there is a time pressure, the courier needs to bring that packet as fast as possible from A to B. If B receives it and sees that it is contaminated, they will need to reorder — losing precious time which could be life saving minutes.

A box with various sensors inside, control logic for realtime checking, and an alerting function lets the receiver know as soon as it is contaminated without waiting for the courier to arrive.

We also created a web application that uses Bluetooth from the browser to connect to the Teensy and configure it remotely — setting thresholds for the 3 sensors and seeing the statistics of the whole transport.

## Used Hardware

From the MakeZurich kit:

- [The Things Uno](https://www.thethingsnetwork.org/docs/devices/uno/) for tryouts and as a plan B LoRaWAN interface
- The breadboard
- Unsoldered the sensor module from the badge
- The Box itself as a container

Additionally:

- 5V Emergency battery pack for cellphones
- [Teensy 3.6](https://www.digikey.ch/en/product-highlight/s/sparkfun/teensy-3-6-development-boards)
- [HC-05 Bluetooth module](https://components101.com/wireless/hc-05-bluetooth-module)
- [Miromico SOS Button](http://www.miromico.ch/fmlr-lorawan-modules.html) — hacked into to trigger LoRaWAN messages

## Team

The team was formed ad-hoc at MakeZurich and consisted of [Manuel Di Cerbo](http://www.nexus-computing.ch), [Tony Kümin](http://kumin.ch) and [Michel Racic](http://racic.ch).

## Hacking the Miromico SOS Button

This was my main goal and I had most fun fiddling around with it to see what's possible. Through the programmer interface, I tried to exploit the AT commands to inject a payload.

We found that we could use the button itself — pin one side to ground and the other to a GPIO set to high. By using a custom delay as parameter, we could generate different payloads as event types using different delays. We saw 3 different payloads (0, 2 and 4).

![Hivemind platform showing LoRa packets received](/images/hivemind-data.png)

## Source Code

The Arduino source is available as a [GitHub Gist](https://gist.github.com/rac2030/cad175b2b7370aac7197be80f413b6d1).
