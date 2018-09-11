'use strict';

const DB = require('./db')
const Joi = require('joi')
const Lock = require('./lock')
const pick = require('lodash.pick')
const bcrypt  = require('bcrypt');
const reject = require('../utils/model').reject

const SALT_ROUNDS=10

const schema = Joi.object().keys({
  username: Joi.string().required(),
  password: Joi.string().required(),
  name: Joi.string(),
  birthDate: Joi.date(),
  id: Joi.number().integer(),
  updated_at:Joi.date().required(),
  created_at: Joi.date().required()
});
const READ_ONLY=["username", "password", "id"]

var User = DB.Model.extend({
   hasTimestamps: true, 
  tableName: 'users',
  locks: function() {
    return this.hasMany(Lock, "userId");
  },
  initialize: function() {
    this.constructor.__super__.initialize.apply(this, arguments);
    this.on('saving', this.validateSave);
  },
  validateSave: function() {
    const {error, _} = Joi.validate(this.attributes, schema)
    if (error) throw error
  },
  parse: function(attributes){
    const {birthDate}  = attributes
    if(birthDate) attributes.birthDate = new Date(birthDate)
    return attributes
  },
  patch: function(updates){
    let attributes = pick(updates, ['name', 'birthDate'])
    if (Object.keys(attributes).length) return this.save(attributes, {method:'update', patch: true})
    return reject('No modifiable properties passed')
  }
},
{
  put: async (existing, modified) => {
   if (existing.get('id') === modified.get('id')) {
     const attemptToOverwrite = READ_ONLY.some((prop)=>{
      return existing.get(prop) !== modified.get(prop)
     })
     if (attemptToOverwrite){
        return reject("Attempt to modify read only attributes")
     }
     return modified.save(null, {method:'update'})
   } else {
     const conflict = await User.where({id:modified.get('id')}).fetch()
     if (conflict) {
      return reject("Attempt to replace existing user")
     }
     return modified.save(null, {method:'insert'})
   }
  },
  encrypt: (password) =>{
    return bcrypt.hash(password, SALT_ROUNDS);
  }, 
  create: async ({username, password}) => {
    const encrypted = await User.encrypt(password)
    return User.forge({ username: username, password: encrypted}).save()
   },
   dependents:["locks"]  
});

module.exports = User