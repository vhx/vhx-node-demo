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
const path        = require('path');
const template    = require('./views/templates');
const vhx         = require('vhx')(process.env.VHX_API_KEY);
const app         = express();

/* Express App
..............................*/
app.set('port', process.env.PORT);
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
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
  vhx.collections.listItems({
    collection: process.env.VHX_COLLECTION_ID
  }, function(err, collections) {
    template(res, {
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
  if (req.body.customer) {
    vhx.customers.create({
      name: req.body.customer.name,
      email: req.body.customer.email,
      product: process.env.VHX_PRODUCT_ID
    }, function(err, customer) {
      req.session.customer_id = customer.id;
      res.send('well done');
    });
  }
});

app.post('/login', function(req, res) {
  req.session.customer_id = 2041092;
  res.redirect('/watch/54355');
  /* User Account Authorization
  .....................................
  For the sake of this demo site, no actually user authorization
  is implemented. You can authorize your users how ever you want.
  We recommend http://passportjs.org/. On POST to this route (/login),
  we'll mock login the mock user by created a session with the
  customer id.
  ..................................... */


  // vhx.customers.retrieve(15, function(err, customer) {
  //   // asynchronously called
  // });
  // req.session.customer_id
  //
  // template(res, {
  //   layout: 'layout',
  //   yield: 'modals/login'
  // });
});

app.get('/login', function(req, res) {
  template(res, {
    layout: 'layout',
    yield: 'modals/login'
  });
});

app.get('/watch/:video_id', function(req, res) {
  console.log(req.session.customer_id);

  if (!req.params.video_id) {
    res.send('Not Found');
    return;
  }
  
  if (!req.session.customer_id) {
    res.send('Not Authorized');
    return;
  }

  /* VHX > Authorize Customer
  .....................................
  a call to vhx.collections to get back our collection items
  http://dev.vhx.tv/docs/api/?javascript#authorizations-create
  ..................................... */
  vhx.authorizations.create({
    customer: req.session.customer_id,
    video: req.params.video_id
  }, function(err, authorization) {
    if (err) {
      res.send('Not Authorized');
    } else {
      template(res, {
        layout: 'layout',
        yield: 'watch/watch',
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
