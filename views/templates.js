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

/* Template Helper Data
.................................*/
const getTemplateHelperData = function(req, obj) {
  return {
    yield: obj.yield ? obj.yield : '',
    random_email: 'vhx.demo+' + random.generate(12) +  '@gmail.com',
    logged_in: (req.session.customer_href) ? true : false,
    current_path: req.path,
    hasBack: (obj.yield && obj.yield.indexOf('watch') >= 0) ? true : false,
    hasFooter: (obj.yield && !obj.yield.match(/unauthorized|modals/)) ? true : false,
    hasModals: (obj.yield && obj.yield === 'home/home') ? true : false,
    customer: {
      email: req.session.customer_email
    },
    config: {
      typekit_id: process.env.TYPEKIT_ID
    }
  };
};

/* Template Rendering
..............................*/
const Template = function(req, res, obj) {
  let data = _.extend({}, getTemplateHelperData(req, obj), obj.data);

  if (obj.layout) {
    let layout = handlebars.compile(fs.readFileSync(views_dir + '/layouts/' + obj.layout + '.hbs').toString());
    return res.send(layout(data));
  }
  if (obj.partial) {
    let partial = handlebars.compile(fs.readFileSync(views_dir + '/' + obj.partial + '.hbs').toString());
    return res.json({
      id: req.query.id,
      partial: partial(data)
    });
  }

};


module.exports = Template;
