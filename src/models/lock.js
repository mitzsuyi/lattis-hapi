'use strict';

const DB = require('./db')
const Joi = require('joi')

const schema = Joi.object().keys({
  name: Joi.string(),
  macId: Joi.string().guid().required(),
  userId: Joi.number().required()
});

var Lock = DB.Model.extend({
  tableName: 'locks'
});

module.exports = Lock