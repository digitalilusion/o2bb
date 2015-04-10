# FIWARE Orion Context Broker to Backbone Sync

## Introduction

* [FIWARE Orion Context Broker](http://catalogue.fiware.org/enablers/publishsubscribe-context-broker-orion-context-broker) (aka Orion) is a [General Enabler](http://catalogue.fiware.org/enablers) (GE) that provides object allocation, query and Pub/Sub operations. Formally, Orion is implemented following the NGSI10/NGSI9 specification.
* [BackboneJS](http://backbonejs.org/) is a JavaScript framework which enables us to build rich web apps.
* [Orion 2 Backbone](https://github.com/digitalilusion/o2bb) (aka O2BB) is "the glue" between these entities. 
With O2BB we can integrate our project quickly in an easy way with FIWARE's Orion.

__O2BB enables to companies accelerated by FIWARE a rapid, easy and cross-platform integration with Orion GE__

__We've developed O2BB for [Outbarriers](https://outbarriers.com) project__

## Usage

O2BB is pretty straightforward.

1. Include the orion.js file after _Underscore & Backbone_ references:

    ```
    <script src="/underscore.js" charset="utf-8"></script>
    <script src="/backbone.js" charset="utf-8"></script>
    <script src="/orion.js" charset="utf-8"></script>
    ```
2. If you want to create a Backbone Model, you must extend it from `Backbone.OrionModel`. In case of a collection, `Backbone.OrionCollection`.
Due to Orion functionality, you must set up a `type` prototype object.
If your access to Orion requires an `access token`, you also must set up the `token` prototype object.

3. Voilà!

## Demo

This demo connects to __Orion Context Broker Test Bed__. That instance runs on the following address http://orion.lab.fiware.org:1026 and it's public but you need an _access token_.

It's necessary a simple HTTP proxy server made in __NodeJS__ because of __Orion Test Bed instance__ does not implement [CORS](http://en.wikipedia.org/wiki/Cross-origin_resource_sharing) and we can't talk directly with it.

Follow these steps to run the demo:

1. Clone this repository

    ```
    git clone https://github.com/digitalilusion/o2bb.git
    
    ```
2. Install NodeJS packages

   ```
   cd o2bb
   npm install connect serve-static proxy-middleware
   ```
3. Run the server.js

   ```
   cd o2bb
   node server.js
   ```
4. Open your browser, enter the address __http://localhost:8080/html/orion_test.html__ and follow the instructions!

## License

MIT License.

&copy; 2015 
[Digitalilusion S.L.](http://digitalilusion.com)






