'use strict'

const boom = require('boom')

const withErrorHandler = async (request, reply, handler)=>{
  try {
    const result = await handler(request, reply)
    return result
  } catch(err) {
    if(err.isBoom) return err
    return boom.boomify(err)
  }
}
module.exports = withErrorHandler
