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
npm install
ionic build --prod
npx cap add android
cp ./AndroidManifest.xml ./android/app/src/main/
npx cap copy
cd android
./gradlew assembleRelease
```

After this you'll find the apk in
`android/app/build/outputs/apk/release/app-release-unsigned.apk`. You need
to sign this file before installing, like shown
[here](https://ionicframework.com/docs/v1/guide/publishing.html):

```
cd ./app/build/outputs/apk/release/
keytool -genkey -v -keystore my-release-key.keystore -alias cups-client -keyalg RSA -keysize 2048 -validity 10000
mv app-release-unsigned.apk cups.client.apk
jarsigner -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore cups.client.apk cups-client
```

Please note that the Cordova HTTP plugin has a default timeout on connections
of 30 seconds. I've modified manually in the code of the plugin this timeout
to the timeout indicated in the options of the javascript remote call. The
problem is that if you cannot connect to the CUPS server, it takes 30 seconds
until you get an error message.
