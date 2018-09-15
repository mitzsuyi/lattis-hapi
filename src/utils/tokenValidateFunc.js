'use strict';
const User = require('../models/user.js')
const validate = async function(decoded, request){
  const exists = await User.forge({id:decoded.id}).fetch()
  return {
    isValid: !!exists
  }
}

module.exports = validate
