# VHX API &mdash; Node Demo Site
![wintergarten screenshot](https://cloud.githubusercontent.com/assets/447100/13134060/225066d0-d5b7-11e5-9ab4-d0a360b0c6c6.jpg)

A Node.js demo site powered by the VHX API. Read more about the VHX API at our [Developer Docs](http://dev.vhx.tv).

## Getting Started

To take a deeper look at the ins and outs of the demo site, or to use it as a starting point for your own Node VHX powered site see below.

**Initial Setup**

**1)** Fork the repo<br>
**2)** Run `npm install`<br>
**3)** Add an `.env` file. The demo site uses the following:

```
PORT=1896 // or any available port
VHX_API_KEY=YOUR_API_KEY // get this from the VHX Platforms Dashboard
TYPEKIT_ID=YOUR_TYPEKIT_ID // only if you want to use typekit
SESSION_SECRET=YOUR_SESSION_SECRET // for express-sessions
```

If you don't have an account [sign up here](https://www.vhx.tv/signup?survey_sale_type=fulfillment&ref=github-node).

Once you have an account, you can get your [API Key here](https://www.vhx.tv/admin/platforms). You'll also need to setup your product, collections, and add any videos via the [VHX Dashboard](https://www.vhx.tv/admin). Any API request `hrefs` in the demo site codebase, will need to be replaced with your own resources from your VHX account.

**Starting the server**

**1)** Run `npm start`  
**2)** Go to: http://localhost:1896 (or whatever port you set)

## Developer Support

Our developers are here to help with any implementation questions you might have. Get in touch with us via email at [api@vhx.tv](api@vhx.tv).
