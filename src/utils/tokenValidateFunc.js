'use strict';
const User = require('../models/user.js')
const validate = async function(decoded, request){
  const exists = await User.where({id:decoded.id})
  return {
    isValid: exists
  }
}

module.exports = validate
