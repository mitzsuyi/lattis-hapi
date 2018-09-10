'use strict';

const DB = require('./db')
const Joi = require('joi')

const schema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required(),
  name: Joi.string(),
  birthDate: Joi.date()
});

var User = DB.Model.extend({
  tableName: 'users'
},
{
  create: function({username, password}) {
    return User.forge({ username:username, password: password}).save();
  },
});

module.exports = User