'use strict';

const DB = require('./db')
const Joi = require('joi')
const Lock = require('./lock')

const schema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required(),
  name: Joi.string(),
  birthDate: Joi.date()
});

var User = DB.Model.extend({
  tableName: 'users',
  locks: function() {
    return this.hasMany(Lock);
  }
},
{
  create: function({username, password}) {
    return User.forge({ username:username, password: password}).save();
  },
});

module.exports = User