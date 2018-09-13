'use strict';

const validate = async function(decoded, request){
  return {
    isValid: !!decoded.id
  }
}

module.exports = validate