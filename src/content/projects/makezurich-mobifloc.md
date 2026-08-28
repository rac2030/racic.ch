---
title: "MakeZurich — MoBiFloC"
pubDate: 2017-02-04
description: "A cheap and portable bike commuter flow counter node to enhance the existing sensor network."
author: "Michel Racic"
category: "hackathon"
tags: ["arduino", "hackathon", "lorawan"]
heroImage: /images/projects/MakeZurich-logo.png
aliases: ["/project/MakeZurich-MoBiFloC"]
---

Project entry for the [MakeZurich](https://makezurich.ch) 2017 Hackathon.

A cheap and portable bike commuter flow counter node to enhance the existing sensor network. This will also be helpful to quickly bring up nodes at the right place to evaluate new routes and how they are used.

<!--more-->

## Challenge
![Challenge slide](/images/projects/makezurich-mobifloc/challenge-slide.jpg)

* An existing loop counter (see existing sensors above) costs CHF 5000 (sensor + installation).
* Each loop counter actually consists of two loops in order to detect the direction of travel.
* Sensors use SIM cards and work reliably (traffic via France for some reason–maybe French SIM card or so).
* Robert Dorbritz, the responsible for slow traffic in Zürich, is mainly interested how bicycle usage develops over time. I.e. is it increasing? To what extent?
* Understanding the behavior of cyclists in different weather conditions is also an interesting aspect. E.g.: Is it worthwhile to plow the snow away from bike lanes in winter, given that the number of cyclist is very low?
* Where is the largest influx of cyclists entering the city?

## Idea
Challenge accepted... but on what should we focus?

Create a measuring unit that is cheap (due to requiring numerous deployments, vandalism against the sensors) and can be deployed to where its needed without much efforts to enrich the [existing data](https://data.stadt-zuerich.ch/dataset/verkehrszaehlungen-werte-fussgaenger-velo). As for the communication technology we wanted to use the existing [LoRaWAN infrastructure from TTN Zürich](https://www.thethingsnetwork.org/community/zurich/) because it was the main topic of this hackathon. After a week of research and tryouts in the [MechArtLab](http://www.mechatronicart.ch/mechartlab/) I picked up on the idea of using a differential pressure sensor for this (idea source is [TOMORROW LAB](http://www.tomorrow-lab.com/lab16.php)) and so the journey begins.
<figure class="floatright30"><img src="/images/projects/makezurich-mobifloc/SHT31.jpg" alt="SHT31 sensor" /></figure>

We wanted to use 2 differential pressure sensors with one tube each, which would allow us not only to count but also determine the direction of the bicycles passing over the sensor. We have no clue how exactly we want to distinguish pedestrians from bicycles but some ideas floating around was calculating the difference in speed between the two tubes being stepped on or the intensity of the pressure change. As we had a sonar sensor in the box, this could also have been used in some way and maybe combining the different sources we can find out the difference.

In order to enrich environmental data collection, we wanted to get current temperature and humidity from that place using the SHT31 we got as sample from Sensirion. Given that we did not had any 4-Pin flex PCB adapters on hand, some tinkering was involved - as you can see in the picture - having some fun with soldering tiny wires and fixing with hot glue such that it doesn't break the PCB.

As a bonus and as we had the uBlox GPS on hand, we considered having a button on the measuring unit for initializing it after it has been placed. It would then transmit the current GPS position for the data that gets logged from this device. The benefit of an automated procedure for the operator is not to have to manually enter GPS data into some tool; also it prevents human error. To save the bandwidth the initialization procedure would only be required when the sensor gets relocated.

## Used Hardware
From the MakeZurich kit (Box #3) , we used:

* Arduino Pro Mini 3.3V (8MHz)
* [Microchip RN2483 LoRaWAN modem](https://github.com/rac2030/MakeZurich/wiki/Hello-Lora-with-Arduino-Pro-mini-and-Microchip-RN2483)
* [GPS uBlox PAM 7Q](https://github.com/rac2030/MakeZurich/wiki/ublox-PAM-7Q-%28GPS%29) 

Matthias Schibli from [Sensirion](https://www.sensirion.com) was there and provided us samples of their sensors which we used:

* [SHT31 - Temperature and humidity sensor](https://github.com/rac2030/MakeZurich/wiki/SHT31)
* [SDP610 - Differential pressure sensor](https://github.com/rac2030/MakeZurich/wiki/SDP610-%28Differential-pressure-sensor%29)
* [SDP3x - Differential pressure sensor](/projects/sensirion-sdp3x-driver)

## Team members
The team was formed on the MakeZurich slack channel and [Tony Kümin](http://kumin.ch) joined me ([Michel Racic](http://racic.ch)) for implementing the idea of a simple and cheap prototype for enhancing the current sensor network for Zürich.

## Day 1 - Friday, 3rd February
During the OpenLab week before, I already tested most of the sensors from the kit and got the LoRaWAN communication working. From Migros DoIt I organized a 5 Meter tube which did fit the spec of the SDP610 Sensor that it will nicely fit on the connector.

<figure class="floatright30"><img src="/images/projects/makezurich-mobifloc/brainstorming.jpg" alt="Brainstorming" /></figure>
First we did some brainstorming of the ideas that are floating around and explained Robert (from Tiefbauamt Stadt Zürich) what we want to do.
We started connecting all the sensors and electronic pieces on the breadboard along with wiring it such that we can start tinkering on the software side.
The work was divided that Tony will take care of the web application to visualize what we measure and I will tinker with the Arduino code to send the data.

Fail #1 happened when we tested how well the SDP610 responds after mounting the first tube on a plate and connecting it... sadly the tube was not soft enough which meant that we need to get out and buy a new tube. Luckily a Jumbo was just around the corner and they had one with soft silicone, a bit bigger than the one we used and did fit on the sensor but we it did fit our old tube and we decided to cut a short piece from the old tube to make a connector between the sensor and the soft tube.
We used 2 different sensors from Sensirion as we wanted to try out both and used them on the same I2C bus (together with the SHT31) and did not want to fix the address clash.

![Prototype with only 1 tube](/images/projects/makezurich-mobifloc/day1-prototype-1tube.jpg)
After a long day of hacking and having fun chatting with other participants we could test out our first prototype, for that we took the bicycle from another challenge and did some test drives outside as well as inside. You can see how it looked like in the [video](#) where you can also see that we struggled at the beginning with the tubes not tight enough on the sensor, this did lead to air leakage and wrong sensor readings. The spikes you see in the picture are the pressure readings for both wheels going over the tube.
![Short test outside the building looking at the sensor data](/images/projects/makezurich-mobifloc/fieldtest-sensordata.jpg)

When the first tire compresses the tube, the air from inside will flow trough the sensor to the outside and when the wheel is gone the reverse will happen and the tube, which has one side closed and the other attached to the sensor, will suck in the air from outside. That explains why each wheel generates 2 spikes shortly after each other.

After a long working day, we need to fit the typical hackathon prototype and have some pizza for dinner.
![](/images/projects/makezurich-mobifloc/hackathon-dinner.jpg)


## Night from Friday to Saturday
<figure class="floatright30"><img src="/images/projects/makezurich-mobifloc/participant-badge.jpg" alt="Participants badge" /></figure>
At some point, Tony did go home to his girlfriend but I decided to keep on hacking all night long as it is the spirit of a 2 day hackathon ;-) - as I did not get much sleep the week before it was a tough decision but there is always a turnaround point when you feel overtired you get that extra boost. Instead of working on our project all the time, we had a lot of fun at the venue and I was hacking on the participant badge (which was a hardware batch with a [MicroBit](http://microbit.org)) and I modified it so it will broadcast my custom message to the badges of other participants nearby via Bluetooth. Pressing on the buttons did each broadcast a different message as well as shaking the badge, sadly the batteries of the badges died already on the first day but it was a nice python exercise to play with the MicroBit. The code is up on [my MakeZurich GitHub](https://github.com/rac2030/MakeZurich/blob/master/MZ-badge-fun/MZ-rac-badge.py).


Afterwards, all except Gonzalo Casas who slept on the couch did go home, I concentrated again on our project and hacked on the Arduino code getting all of the components working together in the same sketch and transmitting the data via LoRaWAN to a MQTT where the web application from Tony could receive and visualize it.

## Day 2 - Saturday, 4th February
<figure class="floatright"><img src="/images/projects/makezurich-mobifloc/day2-prototype-2tubes.jpg" alt="Prototype with 2 tubes for direction" /></figure>
The second differential pressure sensor from Sensirion was a bit tricky as the mountings on the dev breakout we got has very tiny diameter, impressive to get such a sensor that tiny in size but the dev board was big enough to tinker with it on a breadboard. Matthias from Sensirion did pass by the hackathon bringing some very tiny tubes he had at home and helped to glue it together with the tiny hard tubes we had which did fit the big soft tubes, yes a lot of tinkering involved but hey it's a hackathon and we did need to just get it somehow working in a short time. See the final breadboard picture for a closeup, the red tubes where mounted on the sensor and the tiny hard tubes glued over it. After the hackathon, I took out the code we used to communicate with the sensor (using some sample code from Matthias) and made it into a library (see [Sensirion SDP3x Arduino driver]({{< ref "libs/sensirion-SDP3x-driver.md" >}})).

On day 2 we mainly concentrated on getting the web GUI finished together with some monkeys (see GUI in action [video](#)) and combining the sensor readings. As always, time is running out so we haven't combined all the sensors in the code but at least we have the individual pieces together and it detects when there is a bicycle rolling over (pattern). It will collect statistics data and send every 10 minutes a message over LoRaWAN with a timestamp and the count as well as data about the temperature.

The reason we only send data every 10 minutes (during demo every 1 minute) is the available LoRa bandwidth and the allowed air time per device of 15 seconds per day. We minimized the payload as much as possible but still the air time used will also be affected by the distance to the next hub which will pickup our signal and send the data to the MQTT of the TTN network.

![Final breadboard after getting home again and a goooooooooooooooood night (sunday) of sleep](/images/projects/makezurich-mobifloc/closeup-final-breadboard.jpg)

## Source code
The Arduino and the NodeJS WebApplication is available on GitHub @ 
https://github.com/rac2030/MakeZurich/tree/master/MoBiFloC

## Videos
#### First outdoor trials with the prototype
<div style="position: relative; width: 100%; padding-bottom: 56.25%; margin: 1.5rem 0;"><iframe src="https://www.youtube.com/embed/IlvafwAg5jA" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: var(--radius-lg);" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>

#### LoraWAN data receiver web GUI in action
<div style="position: relative; width: 100%; padding-bottom: 56.25%; margin: 1.5rem 0;"><iframe src="https://www.youtube.com/embed/UFf2p6Vvhg4" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: var(--radius-lg);" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>

#### Presentation on the end of the hackathon
<div style="position: relative; width: 100%; padding-bottom: 56.25%; margin: 1.5rem 0;"><iframe src="https://www.youtube.com/embed/oF1MmIcnQl0" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; border: none; border-radius: var(--radius-lg);" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>

