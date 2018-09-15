'use strict';

const DB = require('./db')
const Joi = require('joi')
const pick = require('lodash.pick')
const bcrypt  = require('bcrypt');
const reject = require('../utils/model').reject
const Boom = require('boom')

require('./lock')

const SALT_ROUNDS=10

const schema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required(),
  name: Joi.string(),
  birthDate: Joi.date(),
  id: Joi.number().integer(),
  updated_at:Joi.date(),
  created_at: Joi.date()
});
const READ_ONLY=["username", "password", "id"]

const User = DB.Model.extend({
  hasTimestamps: true, 
  tableName: 'users',
  locks: function() {
    return this.hasMany('Lock', "userId");
  },
  initialize: function() {
    this.constructor.__super__.initialize.apply(this, arguments);
    this.on('saving', this.validateSave);
    this.on("created", (model)=>{
      const nulls = ['birthDate','name']
      nulls.forEach((attr)=>{
       if(model.get(attr)==null) model.unset(attr)
      })
    })
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
  parse: function(attributes){
    const {birthDate}  = attributes
    if(birthDate) attributes.birthDate = new Date(birthDate)
    const nulls = ['birthDate','name']
    nulls.forEach((attr)=>{
      if (attributes[attr]==null) delete attributes[attr]
    })
    return attributes
  },
  patch: function(updates){
    let attributes = pick(updates, ['name', 'birthDate'])
    if (Object.keys(attributes).length) return this.save(attributes, {method:'update', patch: true})
    return reject(Boom.badData('No modifiable properties passed'))
  }
},
{
  put: async (existing, modified) => {
    const existingId = existing.get('id')
    const modifiedId = modified.get('id')
   if (existing.get('id') === modified.get('id')) {
     const attemptToOverwrite = READ_ONLY.some((prop)=>{
       console.log(prop, existing.get(prop), modified.get(prop))
      return existing.get(prop) !== modified.get(prop)
     })
     if (attemptToOverwrite){
        return reject(Boom.conflict("Attempt to modify read only attributes"))
     }
     return modified.save(null, {method:'update'})
   } else {
     const conflict = await User.where({id:modified.get('id')}).fetch()
     if (conflict) {
      return reject(Boom.forbidden("Attempt to replace existing user"))
     }
     return reject(Boom.notFound("User does not exist")) 
   }
  },
  encrypt: (password) =>{
    return bcrypt.hash(password, SALT_ROUNDS);
  }, 
  validatePassword: async (user, plaintext)=>{
    const isValid = await bcrypt.compare(plaintext, user.get('password'))
    return isValid
  },
  create: async ({username, password}) => {
    const encrypted = await User.encrypt(password)
    return User.forge({ username: username, password: encrypted}).save()
   },
   dependents:["locks"]  
});

module.exports = DB.model('User', User);
