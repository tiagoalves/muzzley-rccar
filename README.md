# Muzzley RC Car demo

This repository demonstrates how [Muzzley](http://www.muzzley.com) can be used to remotelly control a Raspberry Pi-powered remote-controlled car with your Android or iOS smartphone.

This project uses Node.js.

For more detailed information, read Muzzley's blog post at [http://blog.muzzley.com/post/47822725051/rc-car-controlled-through-internet](http://blog.muzzley.com/post/47822725051/rc-car-controlled-through-internet).

## Installation

This project must be installed and run on a Raspberry Pi.

It uses the Node.js `speaker` module. On Debian/Ubuntu, the ALSA backend is selected by default, so be sure to have the `alsa.h` header file in place:

    sudo apt-get install libasound2-dev

Then, you can simply install the Node.js modules with the usual

    npm install

If you want to have this project auto-starting every time the Raspberry Pi boots, copy the provided `Upstart` script:

    cp upstart/muzzcar.conf /etc/init/

This Upstart script assumes this project is located at `/home/pi/muzzley/muzzcar`

## Running

To run the program manually, run the following command:

    node muzzcar
