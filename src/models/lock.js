'use strict';

const DB = require('./db')
const Joi = require('joi')
const uuidv4 = require('uuid/v4');
const User = require('./user')

const schema = Joi.object().keys({
  name: Joi.string(),
  macId: Joi.string().guid().required(),
  userId: Joi.number().required(),
  updated_at:Joi.date().required(),
  created_at: Joi.date().required(),
  id: Joi.number().integer()
});

var Lock = DB.Model.extend({
  hasTimestamps: true,  
  tableName: 'locks',
  initialize: function() {
    this.constructor.__super__.initialize.apply(this, arguments);
    this.on('saving', this.validateSave);
  },
  validateSave: function() {
    const {error, _} = Joi.validate(this.attributes, schema)
    if (error) throw error
  },
  patch: function(params={}){
    if(Object.keys(params).length) return this.save({name: params.name}, {patch: true})
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