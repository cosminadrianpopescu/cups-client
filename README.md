Cups Client
========================================

This is a simple client to connect to a CUPS server to print documents. It can
run on Android devices or as a standalone PWA application. 

I've search a lot of time for a decent CUPS client, and since I couldn't find
one, I've developed this one. 

For example, [CUPS
Printing](https://play.google.com/store/apps/details?id=io.github.benoitduffez.cupsprint&hl=en_US)
will try to install the printers locally. I've also used
[JfCupsPrint](http://mobd.jonbanjo.com/jfcupsprint/default.php), but also it
installs the printers locally. 

This application is just a client. This means that all the printer
administration (available printers, default options, jobs handling etc.) is
done on the CUPS server. This will just connect to the server, display the
available printers and will send documents to them. 

The communication with the server is made using the [IPP
protocol](https://en.wikipedia.org/wiki/Internet_Printing_Protocol). The
javascript implementation is based on the [node ipp
library](https://www.npmjs.com/package/ipp) that I heavily modified. This is
MIT licensed. The rest of the code is GPL 3.0 licensed. 

## Installation

You can download the latest release from the releases page and install it, or
you can build it.

## Building

```
git clone https://github.com/cosminadrianpopescu/cups-client
cd cups-client

```
