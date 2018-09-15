'use strict'

const Config = require('../../config')

const JWT = require('jsonwebtoken')

const options = { 
algorithm: 'HS256', 
expiresIn: Config.JWT_TOKEN_EXPIRY  
}; 

const generateAccessToken=(payload)=>{
  return JWT.sign(payload, Config.JWT_SECRET, options)
}

exports.generateAccessToken=generateAccessToken