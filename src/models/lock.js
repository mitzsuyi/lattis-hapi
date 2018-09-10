'use strict';

const DB = require('./db')
const Joi = require('joi')
const uuidv4 = require('uuid/v4');
const User = require('./user')

const schema = Joi.object().keys({
  name: Joi.string(),
  macId: Joi.string().guid().required(),
  userId: Joi.number().required()
});

var Lock = DB.Model.extend({
  tableName: 'locks',
  patch: function(params={}){
    return this.save({name: params.name}, {patch: true})
  },
  user: function() {
    return this.belongsTo(User,"userId");
  },
},
{
  create: function(params={}) {
    return Lock.forge({ name: params.name, macId: uuidv4(), userId:params.userId}).save();
  },

});

module.exports = Lock 