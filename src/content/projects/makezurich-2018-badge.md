---
title: "MakeZurich 2018 Badge"
pubDate: 2018-05-27
description: "IoT conference badge with e-Paper display, Sensirion sensors, and WiFi connectivity, designed and built for the MakeZurich vol. II hackathon."
author: "Michel Racic"
category: "hackathon"
tags: ["hackathon","makezurich","badge","electronics","wifi"]
heroImage: /images/projects/messydesk.jpg
aliases: ["/mz18/", "/project/MakeZurich-18-badge"]
---

You received your [MakeZurich vol. II](https://makezurich.ch) participants badge and want to know more about it?

<!--more-->

For now, documentation is pretty rare as we worked day and night to get you the badge assembled and the firmware up and running just in time.
You can tell the orga team is running a JIT compiler as the night before the hackathon, the badges where finished with assembly and the firmware got flashed.

## Main functionality
As a badge should do what a badge needs to do, it will display your name in the first place.
And don't worry if you run out of battery, as we used a E-Paper display, the last screen will stay and that means you could connect a serial programmer or just 3.3V to it, wait until its on the name view and then just cut the power and we will still see who you are.

![](/images/projects/makezurich-18-badge/nameView.jpg)

#### Name view
This is the standard view which gets loaded once your Name has been registered and it did connect to the Kraftwerk wifi to fetch the details from the server.

#### QR Initialisation view
<figure class="floatright30"><img src="/images/projects/makezurich-18-badge/qrView.jpg" alt="QR Initialisation view" /></figure>
When the badge is not yet registered, this view will be shown until it fetches a name from the server. If you want or need to display this QR code again, you can press SW1 (button on the lower left) to get to this view again.

Whenever you go to that view, it will startup wifi, connect to Kraftwerk and fetch the name from the server and update it. If you want another name to be displayed, please speak to one of the organizers and they can set you a new name.

#### Sensor view
<figure class="floatright30"><img src="/images/projects/makezurich-18-badge/sensorView.jpg" alt="Sensor view" /></figure>
The sensor module has an SHTC3 Temperature and Humidity sensor as well as an SGPC3 Gas sensor sponsored from [Sensirion](https://www.sensirion.com) on board. This view will display the current data and refreshes itself every 5 seconds.

#### E.T. calling home
Yes we collect some data, specifically we send back the current sensor readings every 30 minutes to our server for an experiment. If you want to know what data is exactly sent, connect a serial programmer (you can get one from an organizer if you don't have one) and see the output. Payload is being dumped as well as the responses.

## AT commands
> You got your badge with firmware v.1.0.0 which does not have those commands as they got introduced in v.1.0.1
> Download [this](https://github.com/rac2030/IoT-conference-badge/blob/firmware/firmware/hackathon-kraftwerk/deploy/hackathon-kraftwerk-firmware-v.1.0.1.zip) zip file, unpack it and take a look at the README which gives you the command you can use with the esptool to flash it.

Open Serial Monitor, change to `Both LN & CR` and `115200 baud`

Now you just have to write the commands and see how it works. It's very simple.

* Type `AT` if will be return `OK`   

### AT command list

AT command     | Description   | return     
---------------|---------------|-----------
`AT`  | Check status comunication. | `OK` 
`AT+RESET` | Restart Arduino. | `OK` 
`AT+CCLK` | Get time in milliseconds after Arduino start. | value 
`ATDOH+<PIN>`| Set pin to HIGH. | `OK` 
`ATDOL+<PIN>`| Set pin to LOW. | `OK` 
`ATDIN+<PIN>`| Read pin digital input. | value 
`ATDIP+<PIN>`| Read pin digital input with internal pull up resistor. | value 
`ATAI+<PIN>`| Read analog input. | value 
`ATSNF+<TEXT>`| Set the first name to <TEXT>. | `=> new first name saved in NVM`
`ATSNL+<TEXT>`| Set the last name to <TEXT>. | `=> new last name saved in NVM`

Examples:

```
ATDOH+13  //change status pin 13 to HIGH

ATDOL+13 //change status pin 13 to LOW

ATSNF+Hacker // Set the first name to Michel (whats displayed in red on the name view)
```

## Your turn
You can hack that badge, you can use the NINA module in your own project as well as the EPD as they both are not soldered. The sensor module can be used as well, you only need to desolder it from the badge first if you want to use it standalone.

> There are many more examples on github under the [firmware/examples](https://github.com/rac2030/IoT-conference-badge/tree/firmware/firmware/examples) folder

#### Buttons
You have 4 buttons available, see [buttonWithInterrupt.ino](https://github.com/rac2030/IoT-conference-badge/blob/firmware/firmware/examples/ButtonWithInterrupt/buttonWithInterrupt.ino) for an example on how to use them and which pins they are connected to. You can find also an additional examples on how they can be used with the TaskScheduler library that was used in the badge firmware as well in [taskScheduler.ino](https://github.com/rac2030/IoT-conference-badge/blob/firmware/firmware/examples/taskScheduler/taskScheduler.ino).

#### E-Paper display
There are several examples on how to use the EPD, take a look at the [GxEPD test example](https://github.com/rac2030/IoT-conference-badge/tree/firmware/firmware/examples/GxEPD_SPI_TestExample_NINA) to see how to use it with the GxEPD library.

#### LEDs
You have 4 WS2812b addressable LEDs on the badge, just be aware that they suck power and it's not recommended to use them without external power source. Find an example using the FastLED library in [LED-Siren.ino](https://github.com/rac2030/IoT-conference-badge/blob/firmware/firmware/examples/LED-Siren/LED-Siren.ino).

#### Sensor module
I adapted the arduino library from sensirions github for the sensor module and you can see how to use it in the [SGPC3 demo](https://github.com/rac2030/IoT-conference-badge/tree/firmware/firmware/examples/SGPC3-demo) project.

#### I2C devices
You have 2 I2C buses on the NINA, if on the badge we used one for the sensor module and the other is exposed on the bottom with 2 headers.
See [i2c_scanner.ino](https://github.com/rac2030/IoT-conference-badge/blob/firmware/firmware/examples/i2c_scanner/i2c_scanner.ino) for an example and you can directly use this sketch to scan both buses for devices once you connected something to it.

## Pinout
The pins on the side are 1:1 mapped to the [NINA-W102 minimal breakout](/projects/nina-w102-minimal-breakout) and you can take this pinout for the badge as well.
![NINA-W102 pinout diagram](/images/projects/nina-w102/pinout-diagram.png)
Made by [gnz.io](http://gnz.io), [Download as pdf](https://github.com/rac2030/breakout-boards/raw/master/ublox_NINA-W102/pinout/pinout-diagram.pdf)
## Schematics
See [badge-mainboard-rev.0.3.7.pdf](https://github.com/rac2030/IoT-conference-badge/blob/master/hardware/badge-mainboard-rev.0.3.7.pdf) and [sensors-module-board-rev.0.1.0.pdf](https://github.com/rac2030/IoT-conference-badge/blob/master/hardware/sensors-module-board-rev.0.1.0.pdf) for the corresponding schematics. Additional you want to look at the [NINA-W102 minimal breakout](/projects/nina-w102-minimal-breakout) for more information on the heart of this badge.

## PCB Layout
TBW. but for now, here is a rendering of the backside
![PCB back layout render](/images/projects/makezurich-18-badge/badgebackrender.png)

## BOM
Ref     | Qty   | Value     | Digikey       | Price
--------|-------|-----------|---------------|------------
XX  | X     | XXX     | XXX | CHF XXX
> Note: TBW. but for now you can see https://github.com/rac2030/IoT-conference-badge/blob/master/hardware/badge-mainboard-BOM-r.0.3.7.html


## Making of
TBW. but was a fun journey with lots of last minute fixes and deliveries ;-)

For your enjoyment, here are some pictures that where made during the past couple months while going from an idea to the final badge you have now around your neck.

![](https://lh3.googleusercontent.com/yBERsCrvNWXTpS3rPB3FVUgqzVIt1QwP66tyd9RF3aPjIYTWwhSJ90tZRkxRXQ1UGgIRmhSL-mpWgHYA_xEatZBao09hsejqUJtSSfhqDneTm-p4kUof29t4iw1SVF2Nwjt-9m62d6VFuXqx9zBWO0QyLH-gUPZfvrueDQl1aiqbuxNCkMCpISU2D8AnSx75GZIFzCpG0EES3WLMmJ6kHXB2WV66306k8bWLK55D1i5fP0rKJsw6IZq6Hq4W2wo_wboQEYkqDxh6Lyje03I9t2uhxklFYn6l3Z2E2JXVmFvNBpNFiVSiu8X7algV3-ZV5AKJYCwMqDju02uvuYHeZiLbs6V7Tl4nOEBHlRX-PpNoJycKmYvRE5mzPHrpP8_oR-Up5-uG81LN0IDeNI3HojPe7m2J-zduN_VqTxZBMycGDkhAC7LUZ4Y-FYB0ax1o4nUZ9FwrliCgGbMUF6okz9S2J2Pzk4FuBP1bv5SMjMbyC43I6aDiMOFvAdX242lKHzAx1cuwCY4CMaL-mrcJAzC-vJmywLZsTgRsx-Qd32ybF7-nakY8mFo_sXNVD5OmsMKwfsu_CiplBt9rhhEyWCdTXdvI9vQ9790r4Gw9ig3v4IQPC-I4MrOdug57FQBWPjyncVxHIw5DAIibGT6aSMFJ2JJBqBKwRA=w1374-h1831-no)

![](https://lh3.googleusercontent.com/V8dKI0ypgncpVY1eJm6biwbZXxvXqgX9QV7LIXqj6EUF5nWzogWX9eSefGYYLaDDictr57Pm5pQyvgwuJIlUJVsM8p1UCE1QOPKCpgMo-3XW7ovHOEfibB8zq04ojICid8HRHom1DsA0yiR3aLbfwwCfkqoFYPigDG5IMSn2v0UqPLpRr-wFHXUmTDkyPiiEq3JGjQ-Cq3NiUq2y-wdlcANhgZwjleRi-T0Y0kA7BhvR-xL9PpQdiCo4YIc6ePypjWkp3xR6URNOlpW3rucLTes9EvI8sXCWY91mKCEUzJIm4dS9O13HzFF45VqGBWAulYe_zkHczfcI0xSwQ0EWrMThCgpMeCRWxwBhsz0jkSdl3WGC-kL1ArCLTDjKZNal0xwBFnK94A1nTVlvhH7RAOBW5HVlKag-GiHzZkcptxFGrEf8Zi62edIR90v4IjEzqZmqHjVJjWjL53QFGlVBB8GjtS1R4ZLHhOhwKPXIjcyWXA_xqqK8PiR1BRzOaf6imbABJck-HMr6JJCzIJ074zAKUvChgomHcDxvGd51I8gvwmSFTWlzievUA_v-OB8hyHS-9X9Lg3GEN6HHuCQ-MkV8mmoBwHhQYBwm4k-ZfZxOuh0dA7Yw9YAZxKLkviugR9DhwjjrIkqkOXQi7WAeV1kSDEDE1XTTjQ=w1030-h1831-no)
![](https://lh3.googleusercontent.com/hU8_k2E_eQ67wN4FgIZRYbPBMCtZtzpk88AL_37azbBozEmRYgEzkWIsAPSJlj1XYG60c8boGkwURu5IraME9zxEEWXWu5Ge6VU1V9ArfPjYxWP8qlmCUd1aa3rHkhzXPdtKIztth958RvW0TCV8SQ4XkfHfQIP3cNcwBU4yBtGWcfKDUBc13v9W0sdF3e8-QC1NK9afBuxPnTh1jh2p7wURVjbL9lM6SM9IxT3NNM82xVoE_z0h1XeIt05Od7KHFYpKkZKMXwuLCO7vgx6Y_236f4cae2kULJI2fBwOFZUHgC357x6P_6-NEBPx029Ho0rPYAukLUYePyD5fhrO1g5zYv4Og49XkpB5F5MIiqutP1rrCbdOPz1OBXgroslTlegYqerBCwaFpgcFCX-TZN2UF35ZE9fg6-PX3DxUJrJs9C_RF32LXf58L4IcgfspG1wBLw40EK_Wi3kY8xphfWHZsOQ-HYUAz8yU3oJbIhGkhZTkSuKxL96UkqX2fGirq8oRZKcT4lIFBMfv4IDQv6vAjRRf4EINAHguI-EjeFxXlpJANgdolWb9lPxNebkBkCGvWYIk2kmRU2vGpcvw-y6lQAy51-4nKrpYC6pvIxAaF3EMcjf3VQ8cj0ZTAqmna885fmC0yK3bFrX0qJGHyn5vu75BupPsAw=w1374-h1831-no)
![](https://lh3.googleusercontent.com/s_RxsgjThoHlJQxE2JJ-qNzIfYfFBE3gwHz5lQDgJYc0BQptyfe5MBNb9fYwvvbjsaiwVNnO7vnLdh9WUqNi15_UQiIXzTeCG2Tk3C9begoEpo5X6lSEYbejujY7p_3IG_VP0d689IkIRw4mvT34L1MLkV5YbgJ35QbrohWOOIsbVKwTz5XcZmbrGZjAMaJBBYya3ai-pY2_i0dmIhbE0mazDleXvOQ0vJBFMEmJC_TNrrTU3gWMDd7jTvNZTg3jpjY0sJwBzC9a5kGYRDbLyIssVBMZ1Umw-QVhpjNhH5RvcucxX7G3GF8ZINvkxURX-CgaVvukrvke-JcC7pSVNTYAYTz65WsrRyoS96Z8hKfXDYfsFtbLE3P1_ygCEvvt_mE9MA7DyJo24R8orrq6jo746Ov5FcQnZjvgTp7PZTqiTtUAZXxbClKEoaLX3vaHC_Ma1PRAw9QfEP24t9EhnlQfAz3An8xuJAAUjmYL6mj65xNfhxzoSDmHyBmf9iGDVtWAPejiTNQD6_M3G55TVvpj5HlQN6MIPuQOLv-R4sB-JmR_KzLpRvCgjjWolntKpCGDLPbBh2KEy_IbFHNL_u6iPPm6uLN17EkSje_MSg2eB-QG9YEjy_sxFuDagBUw2wwR3M0rCwAkQ9VYt1Yhm38xDTqwajQWlA=w1374-h1831-no)



![](https://lh3.googleusercontent.com/MIQRzri7IxWL-023wJZXZyot96NO9hWjIH3_AS2A46_IHWzA2qScbFvEw6APkTwpBuwIwVCzcbXs0XNCw-GLP485L0BImrg4r9UXmWBUSsjumABEHO0Z8YzCXnHXpT4BgWVjO84T9_RLQ0WAQFJ8AkztBSP1eRDtZT9h-nwjrQ0dITyDaLZoXZ0mGmzLaEFq5B14HIj0YNjt2GUjnNpc7XNjz8ro-hsOguwn4y9jQJV5XjzDHvtxqnJP76i2G_WA4At4aquGzpm1uxGk8Xwige72ZrcumoJO3tvihG1s0FLQwOjPR4XtwCR8zt0V3cEuoPJOEsKB2MU5KBsJB81iKQWXI3XzivYsPm-3JZ7Y-t3SXIUuDTAGJZMx1d_Q_s6qW8xgREHdkLq1B24exBsRSGWygqaqhw22J4Hgeji4UMzM2jHqaicE81bd36gady4FC9-qvWmcH79dhvn53xZ9ErKFFWEzEUhW_h2v6q-ko1QQ6h2m9qZ9VOlfVOD357pyiTiKERhs0Lr41m-2ls5a66f786rDQ7wAf2nwzwh9GjE7h_wWMlIp4rsIcyAfXFnuH-KgG5V6VV-5TpSVflB7qyMuPudic7nNog-SGEeueFWiHk2gSOdorSaryMAG5-922Hgk_6_0kdeMxjjwED0r0avXVZs_QwoUxQ=w1374-h1831-no)
![](https://lh3.googleusercontent.com/Q9at4ijv9G5eWYk85nqapfzvlRQRCghYx97ORuIAPVkVNGpi-PyhPwt840aCC6V6s6BYM4Ix9Y1bjvwSVCkF4ndlLzTSNWuXpJIpcjeiiiVjeTwzbYgR3eeYRQL8-j4m5mRAYTwGRGfgKcCFhgE7JR0PVj-qm-8_bdiHZq5-S3KTQa5Z9fR8eBBYUr0r5ThyUb4V6OtncNkp6GCDWDbZ45ZxmdUZayOrXmDiXGL5mJu1yIUL78-aLLL2v5ycAwmJtU8DZVJpEs_ibKnKHSkV80WRWCsHQOcqcVpbG_6f3UGW5C1_gofnLVJyBZNax5gyO3Gq0GMmDztuRyyUO3D9VYWUN9P4QmZyGM9Wvty3qcD0l9pGoKFR-e-nAal6lvb9w2iCobx5jn8S66qtPTjEbd1y5uKz4wwpokuoLEH8xs2QbIHYkonNLSa_yhqYB1ZGC4hLoun_snMd4OxUBFYnOlqyIAyAiP95j2OzCaUALS9wUOCVDPOMVpYCucJ5jbVAqgWU7wekJ-jcr-yFhUb-HXzQVY-DxNt74AEkoGNMeXTnm1K8t8vkt3hnyA6LaY4gaetjqXuSrTV3zTDzF4GHpbUJ4DPouI5ZvPtKbVLY2UZ9OaCR9h439iKYuA8TphWq9Y9mHAGo5w4p1HCCHKM2XVKBMWyOS0sxRw=w276-h367-no)
![](https://lh3.googleusercontent.com/5cXkm39FeFHIu2xv3r94QPGsHy7i3xfryQhsecaVC--No6azZFoUyRinnmA4BaG2DhKCIqrqMgqcpbUg0RyJ-Gija4Td1M6atUtAWoow3EWaRFk5Mrml-gFCrcR5vVcupCxMNnhkBMWb7vHXbUCUbCLkttCE-YyfKUj2n5q8xdTEkzKdTVqo0xFhfMn4OcUCGDna97pM78ST_G4jC7Jw8gnSgYB7n0n5W16S7EQOCVRjDtODhdoyZ_aUFBaQSikdux9-QkpfG4ha26JCy4qGBV9rZbcWDhqgeLkE2F-CaapnAucnCbCZaJ5key-CC_7zQJZQ-NCbXuLottyobFG6TWTkFFqaKtNUlyJQ0cdFH0EIVq9hbNWuryuglXryvxrZEPbrIc_jLvKGYWK3cz_SZkVZGiFUASQGUgYFULRl7rcUrKpz_3FnhEUrE85bXJc2Q-70H-kMFbjScfaeWmhY5Z5faFCkXNKik0PKHMvypkPqzjy6wL0TbXBnIZsQZ6qERTSGKpd8sui78wA6SWPlxz-UgaizNH9G3_oAwnXP1Bf9-Ns-EJOLNkmXtJB6y65mJsS7x2r42YxfZ7hvGE-713e8cEH5_FfiWjqCk9mNadf-QIGxoctS5mqJjSHCSJnPzhy0sfb5VDYUcrYBZfmlbV6rU5pBJuPivw=w1470-h1103-no)
![](https://lh3.googleusercontent.com/HQl2_jrPgpVPAqLf0BXMd0uJEaHFCfychaeVc2_uv98WEgm9xH1FYATD4r19b72TQ-Cb6eBVecdV92Hc3oHItnUSXFtQLZ0CT8Hz0bHdETHeE5kac9S3-G1XiCkPsk38j5cwzn94oPxve3EzATr2BM8MLvgZg0GQrAiVKuQpGSUenHRdAWQhwIg9MSOM-9zneaU7IVYS3b568FW9KQNwPU0z0tOBarEPEoi9_85s3uY7J_LTblqQOZPL3skJCQO710eCEW-av9DyHZVvkHWE-Z6xKyB3gP106Y6GrxfxAj5n5XXzKaVX1mVPppFKDczQRC19Ouok9Cxewgz2lIOWCNoAoeheKBdw37QZABHT8bZ9desqL97LQrFKFePx9wmKYvv5KMTsM1OQuyDlmveZTFLjlqQ1swZm2yRhwdtknGW7WyP5iGM3B6sIgm2xUxG10pV8h1eaYNYpr_oxQ02847g4vAiQNbCYR5LmgEIlmGWhHd-H43xJCvEnIqc7ImE_FMHdpMiVcxtpP0R77exePnuJR9XcqQT1_5NPL9GAqrinrI6fdKe0dEnkiF3iZKzH26LI9WaCNnL6N2tRpb72mHhRNLHGe0zcZVGlc9h1OOPRQRNldLYJZGYs1c1e3ekQjC-JHF61Tbn9j3YxH-kOQj6rvCnMEMyRjQ=w1374-h1831-no)
![](https://lh3.googleusercontent.com/FHilIUFvf6oF_KxmytmKRgOIx4ySNe5_a-sIQC0rYly_u-RJffUgnoqfbaCCRx3S79bJnHFY4ggzuzvErb7BF5QUIGrqhuqjAj3EIPC6HM3rKqS9rDbKh2B5jz4eTAzR9nPkH-RTWC1r0z4OrzuSf_alnzjXZ6G8xrpAXXLM27dwF-Hbx4bMVWuRyh1y6TrcK4VLQD8rYcZDFkOTHvdT6_kWiVmVYoaMdDpsLyOjSYVFKUoAfIjpkfPmxc-s5eoZ5tP9H5SBbLtBm0H7jknEoRMe7C_TGvvdtdrIc8ZNl-JF5IOzJ0fcOJpWjaRfzuSJuJ7xNqwOOhqVESTplXTZtNiAPtUb00cNoYfRNJ26GDl64Aq3SSdhYZD9oa0KVR8aXbNSBUrF7Wz-AZzEwpsSModhc3LRroRIiOWKWyIR_GH4sO3jkW5C0Lolrdvc-M8-ba1zOAAiDw89lntvStkduT5EC2SMvTyLCbeOD5QB8EHpe9Aqw6-hYM6YU7v8InBjJ5JtBjie5na-0yEpp-A_B_D3E80M5QUAvRt0f2zC1GACGj-rICysZS9XZETr0SFWxoQaKKUy7szDFUPDLD-PFL7p-qqF1G_UCiQP8WMrBuMV1ih4dwvoUh7_r9lJoXVdY0Tg8LX8F2EGcrWxpv0la7hXRGZjOtVpTQ=w1470-h1103-no)
![](https://lh3.googleusercontent.com/bTxpYn4xVYr9tgK0eR2KjUmKNGleoJUO2dqGPyBLrne5-qHvsGkoT69C9hCI5GmedIuzHAA02DhjzlBb_7hjatYoRAW24SBR0pEPmPbm3VjA1utwPje7losCuaTiD-Q4p_cgQZjZgHdGiOsHvK7IUbTxmyFZ5XsKqeT7xlQ6qBXSOabouwHVPDuSfsgSJKlLvtgfCBkKmSCU8U8ly-mN8akzpYvhbYYkbBoxo04QMg6ggXi-6mW4JA10PuoFhqD7hzHxNNi6jLxfzdYcvSQLsJRQ6tHMQpteYB492mBXJAzDY7hPRs7rD-dU_tLW6dsjJPE4RNDljj2v2yWxb2AFBZhCCGBsDPx6oIlHaCoKQYIsWMvf7oeHnAY3-sSIRV4mgSOIeGRvohH4dmQR_vzWt50UXLhG4340aV1i8iswTblASvEbrcPZFMI_O_SKJl7Unaufc0auKqt1jsY-XUfHNuyoN64xtoaw31q4NWD3oDYCFzEykD3RQPbEp2VVQRtpOQIXMwHVBZhkndOKS04E_OdOxIIPmtDGo_2gZuAaxF02KNBbV7Sjhg5GdTdW2Zaez9eyFZ_Bk5JsFQsX7ri94KJhynnBTfGNFlNTwz38LYy_1Dmz3iA7Bn2hJH9Blp52119X0CPtYd0SMjIkCOZroA9R1dEjc5cIIA=w1470-h1103-no)
![](https://lh3.googleusercontent.com/D1rn1JJIhmrIggX03mDlgwma7m4kh4u9J2c4z4rAq5HoHbi-Zac7bz4MuAVWMpaLfv3wqf72FSLlOpcgGI0sUvTNmsbkAWDS2V0srj6zjoOiV9bLJVvm2YH5l6h8nsMLe17gX2AE3hXAvSjRNioE6ypOh429-eHdzqEzQod7geKcOvVE7R-U8ggUevzQgQt9QqQ-54x3TRvacU_p3_AOYk3RgZGTfzg1teuDcB7pwjOiZAw-k0mXFbflkDKMU8DZ-alRQjoY9wbt96CbIRgE00rtByUhkdj5o0I__zNbDrIuEkG1BLKUBf3l_Ls5L9GpI9814TlVfJegetF0765tK2VuXTuCYmWYnnmXu3Nr67ONn0rdBXG5CZ_0iCKZPBELjMmEqT3SpzLcsj8mVTxKZjGU3k9iwYKxRn1kwKu50ufJDc1b2XTPBoJgj50PR_pO4ZDsIG0Tajlj6X8os5uf_6dZfeMS666cjvvKcXHDeeIlfi8Wz9UsauJyJ_jlOjGcYlWdM6eR3tO0yBcY_1UAR8CkgvZMMbFEwlVkuxKfvbUbIdQ02QLTU-ixA09BG0EsJ8O5UawBbQFccYAHa5CIntEZpp_IjxiKFCMN4JsZW_5tBCDeRBE-5s7KwrzShMLrIuG0tQtr7Vz346hVerJ1EJZfHSlL4gdJVw=w1470-h1103-no)


![](https://lh3.googleusercontent.com/Ph3Q6T55e2Ah3ForL9rGFbsfO68CB1iEre8ORafPkBJl-EodzAGllkqXqH7L4gcPf6NAo9NWCahN3_gTmCN3QZHrHSKG9_r5lMZSxLwWe9eCryV-yW5SNUKxw97UEvFkmnQUwCFUs5y8r8AITk11i4UP_LweOfybEjLppRcy4TCeel6L4HA_4v4uletUgh6h5rK-aXzu2ywZo9LwI_7Ge4vCAgCONGPbx7XrtGscPBx5UVnxU-111wJz2YL_JvmPd-bZp0duowuIsTIpr8xoszbpCUeAxm-YdgU-DBkRR77c8_D-068oNzJtQVS2pAEnjB7RdJ-WSWX20iPsyqeyysoelTR8WCO5pZvRZ8vqHOSRElHsZdA81UttsXHaX-PNQzrHxBWM-rPldbsmLbxuygXts29c0fxcLXHG5kqAfZ1apRtGtcM3lGe6SGHKOIIC7UZ79c4_b0dfwEbMVud88Z8tbhaJCfy8JMCcDLbnq0eTR3WaAjQt_Jt_IV_TIiC7_e9guuc1XNSblOmChjLW3ZTwG5gh5HTFFZo3VN9u7WpGTEJWkKi_ghhhxscSnbJqAy7Guha_cjXPfDygp6_tCtD9nNsWsw-WsVlsBUdtkZrkgluG5vZ6w2LiKm9q304mUkKWw2cLFvqQYi83oqnrJh1TvgYYmWcCag=w1470-h1103-no)
![](https://lh3.googleusercontent.com/0DresBHaC9NjRcYC0OLoQxbVbbvsSMuGPjwX4ypZAgNy2wVyA56Xhf13vv11yCHsgjYtzGQGJIUTlkccCecizyyKcLy0nzR0-T19CfcJN4qF4X05zBygM4a9aPRG_Z_MelHxGGqBkSiTmw2YSAHFFGXMk6AjlybSUbySFl8O-JOOcS9vJyXiqlvvqHhj52M4zt4pY3ubV9RENTuBh2b1Ubb_VMVoGadB1z0JxMKa6tPw6EJzLMEph3CLcUjZJHf2qh-dgSP-7adKe_gM0Uy4Wy5lr0aXabpjBo4v1ZlE9pP5NEXpQ73WlFp1A-vUyrZ1kDz7AdZF5oE3Qz5v3ukAcRjvV-jQhjsAQ8nRQ0hvC4ABZQsfGCrQe6vR2WCJcZ8OY4z0UNP7jQhGzyvBoCUygyfCp2TQqpAdgiCwSnOd91OYe_LpvreoqdQBWPfT4T7T3u8h1kpIiU7s_vN_Np2LTBaYwvaAewLFIRZFJ2FdUUUdBaR9bXOpOxf-guc_6LIutQM5YIpoexblqN3JmzAVVOrV4DKehhNZC1IjqDF1UANbpfSbspctZaKTl9kVW78PZid8DXXVjctsyItyaNI60bREqOJEmi5hM4P-e-1FCG6p-BywYQk4nrO9hfPGDy9uL3iWIkgFopAgsL3Z3A_8wryrdzmPFkZeqw=w1470-h1103-no)
![](https://lh3.googleusercontent.com/vAg_7d9rfl3dKZbnb1Ln-9pJMMxQrX8cF0xi-Vi1B1SPkTRS6IXV0i3Lh0shW_RQXIEQFZCK4ZT59z4LjXZS4PEoCu2lZwqnSTThRlIZmtn7v2tz4-5nJ5fiVI8qu05xj5oNY_wNk5PbGKjQXG971RXLXnWFVGfol265VyVeyl3sI1X-_xeJhtqD_dt6VnDrvzP8D-Ir7eIZHIMxahYXr5RP6uaOdF1OfnUIE6IMCCxgCWGJ9RfTi6X-Rau8u7L3xEcDHSwxu6-YkRjvh7p0NQSsqYqevaAt_VVOpOumpDL8W0ZUGbDpBS3upvzk641Q4Pse9DG3gqJnOcL43xH4EMwBx73zn9TdsayZeC7_HJbBq3iNgmuWgSfdnQisLFnRTa2m9WiyqMHCYrItZouCPG0KZIZ2SpKO5PDr30yJCIhhuqHCL5z30yWgmJlb30oWJaid8nH9i3jG0vjfuzFkgTmt_G3XJ9HQulSNG98LQcJsXb6HKjqQJU6egXJ3hIgIhl-qNKMYO_WGw3g2b5Trc99fvcT0xJ7gjOd5tcdMiosQ1t8C0oAjbV6rIeYIZm1_vOzESh0QXFKrAD2G_KepaiYdwdSOYc0A2UKzRuHUuTzCJOvamkZUN7ERYpOmaSIU9pMGBnFTVjveD84tt3NfU9qkWmM1tKnjmQ=w1374-h1831-no)


## Sources
For now, the Firmware resides in its own branch, this will be merged in to master later. You find it at https://github.com/rac2030/IoT-conference-badge/tree/firmware/firmware where you have the main firmware in the hackathon-kraftwerk folder and a couple of simple example code that has been written during firmware developement under examples. You can use the examples for tryouts or as a starting point.

KiCAD schematic and PCB design sources are available on my github at https://github.com/rac2030/IoT-conference-badge/tree/master/hardware

## Team contributions
During the design phase, this board has been reviewed and challanged from various people that are not github commiters. Therefore here I would like to thank all the people who helped going into production:

- Benjamin Marty
- [Dirk Zugenmaier](http://fastfocus.ch)
- [Gonzalo Casas](http://gnz.io)
- Matthias Schibli
- Michael Ammann
- Oliver Walkhoff
- Tillo Bosshart
- Urs Marti
- [Tony Kümin](http://kumin.ch)

> Note: List is not in a specific order other than taken directly from TTN slack channel mz-badge and I may have forgotten to list someone here, ping me if it's you.
