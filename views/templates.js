'use strict';

/* Environment Vars
..............................*/
require('dotenv').load();

/* Packages
..............................*/
const _           = require('underscore');
const handlebars  = require('handlebars');
const random      = require('randomstring');
const walk        = require('fs-walk');
const fs          = require('fs');
const path        = require('path');
const views_dir   = path.join(__dirname);

/* Register Views as Partials
..............................*/
walk.walkSync(views_dir, function(base_dir, filename) {
  let file    = filename.split(/.hbs/)[0];
  let sub_dir = base_dir.split(/views\//)[1];

  if (sub_dir) {
    let template = fs.readFileSync(views_dir + '/' + sub_dir + '/' + filename, 'utf8');
    handlebars.registerPartial(sub_dir + '/' + file, template);
  }
});

/* Template Rendering
..............................*/
const Template = function(req, res, obj) {
  let layout = handlebars.compile(fs.readFileSync(views_dir + '/layouts/' + obj.layout + '.hbs').toString());
  let data = _.isObject(obj.data) ? obj.data : {};

  data.yield = obj.yield;
  data.random_email = 'customer+' + random.generate(12) +  '@vhx.tv';
  data.logged_in = (req.session.customer_href) ? true : false;
  data.current_path = req.path;
  data.customer = {
    email: req.session.customer_email
  };
  data.config = {
    typekit_id: process.env.TYPEKIT_ID
  };

  res.send(layout(data));
};

module.exports = Template;
