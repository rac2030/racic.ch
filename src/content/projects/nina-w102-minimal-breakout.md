---
title: "uBlox NINA-W102 Minimal Breakout"
pubDate: 2018-05-27
description: "Minimal single-sided breakout board for the uBlox NINA-W102 WiFi module with FTDI-compatible serial header and hand-solderable 1206 components."
category: "electronics"
tags: []
heroImage: /images/projects/nina-w102-breakout.png
---

While working on the [badge design for MakeZurich 2018](/projects/makezurich-2018-badge), I had the need to first make a breakout for the NINA-W102 we got from [u-blox](https://www.u-blox.com) to see what is possible, do some tryouts with different components like the display and start developing drivers and firmware.

This is the outcome of it and as we did go on with the badge design, we switched from having a single-board badge to a modular badge where the modules can be reused standalone in a project. On the final badge design you can reuse the display and the NINA-W102 module in your hacks, and with a little bit of desoldering you can reuse the sensor module (from [Sensirion](https://www.sensirion.com)) as well.

## Key Features

- Really minimal development board — no LDO on board, power it with 3V3
- Serial programmer header matching a standard FTDI adapter — usable solderless
- `VCC_IO` is by default bridged (3V3 IO levels), but the jumper can be cut for different voltages
- Reset and boot buttons connected to the corresponding pins of the NINA
- Power LED connected directly to VCC (can be safely left unpopulated)
- Single-sided PCB layout with 1206-size components and extra long pads for easy hand-soldering
- All headers have a shifted look — allows centering for easy soldering without the breadboard trick

## Pinout

[![Pinout diagram](/images/projects/nina-w102-pinout.png)](https://github.com/rac2030/breakout-boards/raw/master/ublox_NINA-W102/pinout/pinout-diagram.pdf)

Made by [gnz.io](http://gnz.io).

## Schematics

[![Schematic](/images/projects/nina-w102-schematic.png)](https://github.com/rac2030/breakout-boards/raw/master/ublox_NINA-W102/NINA-W102_minimal_breakout-rev.0.5.pdf)

## BOM

| Ref | Qty | Value | Price |
|-----|-----|-------|-------|
| C1, C2 | 2 | 100nF | ~CHF 0.09 |
| C3, C4 | 2 | 1uF | ~CHF 0.12 |
| D1 | 1 | GREEN LED | ~CHF 0.16 |
| J1, J2 | 2 | Conn_01x15 | ~CHF 0.35 |
| R1 | 1 | 1kΩ | ~CHF 0.03 |
| R2, R3 | 2 | 10kΩ | ~CHF 0.01 |
| SW1, SW2 | 2 | Button | ~CHF 0.28 |
| U1 | 1 | NINA-W102 | CHF 8.– ~ CHF 20.– |

## Sources

KiCAD schematic and PCB design sources are available on [GitHub](https://github.com/rac2030/breakout-boards/tree/master/ublox_NINA-W102).

## Team Contributions

Thanks to: Benjamin Marty, Dirk Zugenmaier, Gonzalo Casas, Matthias Schibli, Michael Ammann, Oliver Walkhoff, Tillo Bosshart, and Urs Marti.
