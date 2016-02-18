'use strict';

/* Environment Vars
..............................*/
require('dotenv').load();

/* Packages
..............................*/
const async       = require('async');
const express     = require('express');
const session     = require('express-session');
const cookie      = require('cookie-parser');
const parser      = require('body-parser');
const uuid        = require('uuid');
const template    = require('../views/templates');
const vhx         = require('vhx')(process.env.VHX_API_KEY);
const app         = express();

/* Express App
..............................*/
app.set('port', process.env.PORT);
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(parser.json());
app.use(parser.urlencoded({ extended: true }));

/* Express App - Session
..............................*/
app.use(cookie());
app.use(session({
  resave: false,
  saveUninitialized: false,
  genid: function() {
    return uuid.v4();
  },
  secret: process.env.SESSION_SECRET
}));

/* Routes
..................................... */
app.get('/', function(req, res) {


  let data = [];

  /* VHX > List Collections
  .....................................
  a call to vhx.collections to get back our collections
  http://dev.vhx.tv/docs/api/?javascript#collection-list
  ..................................... */
  vhx.collections.all({}, function(err, all_collections) {

    async.eachSeries(all_collections._embedded.collections, function(collection, callback) {

      /* VHX > List Collection Items
      .....................................
      We then interate over each collection and use its href to get
      back our collection items. Using async's eachSeries method
      allows us to do this sychronously until we trigger the next
      iteration by via the provided callback
      http://dev.vhx.tv/docs/api/?javascript#collection-items-list
      ..................................... */
      vhx.collections.listItems({
        collection: collection._links.self.href,
        product: 'https://api.vhx.tv/products/14444'
      }, function(err, items) {
        data.push({
          name: collection.name,
          items: items._embedded.items
        });

        callback();
      });

    /* DEMO > Complete Callback
    .....................................
    Render the collections data received back
    from the series of VHX API calls into the
    view using handlebars (see templates.js)
    ..................................... */
    }, function() {
      template(req, res, {
        layout: 'layout',
        yield: 'home/home',
        data: {
          collections: data
        }
      });
    });
  });

});

app.post('/join', function(req, res) {
  let redirect = req.body.redirect ? req.body.redirect : '/';

  /* DEMO > Payment and Account Authorization
  .....................................
  For the sake of this demo site, no actual payment information is
  is collected or authorized. For payments, we recommend using Stripe's
  payment api (http://stripe.com). We also mock login the user by
  creating a session with the customer vhx href. You'd save this href in
  your DB, along with any other user account info (i.e. username/password).
  For user account authorization we recommend http://passportjs.org/.
  ..................................... */

  if (req.body.customer) {

    /* VHX > Create Customer
    .....................................
    On post of the join form we can create a VHX Customer, associating
    the customer with our product, which gives the customer access to
    that project by enabling us to make authorization calls (see below)
    on line 165 in the /watch route
    http://http://dev.vhx.tv/docs/api/?javascript#customer-create
    ..................................... */
    vhx.customers.create({
      name: req.body.customer.name,
      email: req.body.customer.email,
      product: 'https://api.vhx.tv/products/14444'
    }, function(err, customer) {
      req.session.customer_href = 'https://api.vhx.tv/customers/' + customer.id;
      res.redirect(redirect);
    });
  }
});

app.post('/login', function(req, res) {

  /* DEMO > User Account Authorization
  .....................................
  For the sake of this demo site, no actual user authorization
  is implemented. You can authorize your users however you want.
  We recommend http://passportjs.org/.

  On POST to this route (/login), we mock login the user
  by creating a session with the customer vhx href. The customer href
  would be something you store in your own DB on account creation.
  ..................................... */
  req.session.customer_href = 'https://api.vhx.tv/customers/2041092';
  req.session.customer_email = req.body.customer.email;

  let url = req.query.redirect ? req.query.redirect : '/';
  res.redirect(url);
});

app.get('/logout', function(req, res) {
  req.session.destroy(function() {
    res.redirect('/');
  });
});

app.get('/watch/:video_id', function(req, res) {

  if (!req.params.video_id) {
    res.send('Not Found');
    return;
  }

  if (!req.session.customer_href) {
    template(req, res, {
      layout: 'layout',
      yield: 'watch/unauthorized'
    });
    return;
  }

  /* VHX > Authorize Customer
  .....................................
  a call to vhx.collections to get back our collection items
  http://dev.vhx.tv/docs/api/?javascript#authorizations-create
  ..................................... */
  vhx.authorizations.create({
    customer: req.session.customer_href,
    video: 'https://api.vhx.tv/videos/' + req.params.video_id
  }, function(err, authorization) {
    if (err) {
      template(req, res, {
        layout: 'layout',
        yield: 'watch/unauthorized'
      });
    } else {
      template(req, res, {
        layout: 'layout',
        yield: 'watch/player',
        data: {
          authorization: authorization
        }
      });
    }
  });
});

app.listen(process.env.PORT, function () {
  console.log("Web server listening on port " + process.env.PORT);
});
