'use strict';

const DB = require('./db')
const Joi = require('joi')
const uuidv4 = require('uuid/v4');

require('./user')

const schema = Joi.object().keys({
  name: Joi.string(),
  macId: Joi.string().guid().required(),
  userId: Joi.number().required(),
  updated_at:Joi.date(),
  created_at: Joi.date(),
  id: Joi.number().integer()
});

const Lock = DB.Model.extend({
  hasTimestamps: true,  
  tableName: 'locks',
  initialize: function() {
    this.constructor.__super__.initialize.apply(this, arguments);
    this.on('saving', this.validateSave)    
    this.on('fetched', this.hidePrivateFields)
    this.on('saved', this.hidePrivateFields)
    this.on('fetched:collection', this.hidePrivateFieldsCollection)
   },

  hidePrivateFieldsCollection: function(collection){
    collection.forEach((model)=>{
      this.hidePrivateFields(model)
    })     
  },  

  hidePrivateFields: function(model){
    model.unset('updated_at')
    model.unset('created_at')
  },  

  validateSave: function() {
    const {error, _} = Joi.validate(this.attributes, schema)
    if (error) throw error
  },
  patch: function(params={}){
    if(Object.keys(params).length) return this.save({name: params.name}, {patch: true})
  },
  user: function() {
    return this.belongsTo('User',"userId");
  },
},
{
  create: function(params={}) {
    return Lock.forge({ name: params.name, macId: uuidv4(), userId:params.userId}).save();
  },

});

module.exports = DB.model('Lock', Lock);
