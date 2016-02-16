'use strict';

/* Environment Vars
..............................*/
require('dotenv').load();

/* Packages
..............................*/
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

  /* VHX > List Collection Items
  .....................................
  a call to vhx.collections to get back our collection items
  http://dev.vhx.tv/docs/api/?javascript#collection-items-list
  ..................................... */

  // 3 collections each with 4 items
  vhx.collections.listItems({
    collection: 'https://api.vhx.tv/collections/1896',
    product: 'https://api.vhx.tv/products/14444'
  }, function(err, collections) {
    template(req, res, {
      layout: 'layout',
      yield: 'home/home',
      data: {
        collections_items: collections._embedded.items
      }
    });
  });
});

app.get('/join', function(req, res) {
  template(res, {
    layout: 'layout',
    yield: 'modals/join'
  });
});

app.post('/join', function(req, res) {
  let redirect = req.body.redirect ? req.body.redirect : '/';
console.log(req.body);
  if (req.body.customer) {
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

  /* User Account Authorization
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

app.get('/login', function(req, res) {
  template(req, res, {
    layout: 'layout',
    yield: 'modals/login'
  });
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
      console.log(authorization);
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
