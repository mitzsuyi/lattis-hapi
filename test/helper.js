'use strict'

const { expect } = require('code');

const itShouldRequireAuthentication = function(server, request){
  return async()=>{
    const response = await server.inject(request)
    expect(response.result.statusCode).to.equal(401)
  }
}

exports.itShouldRequireAuthentication = itShouldRequireAuthentication

const CREDENTIALS={id:1}

const routeRequest = (rootUrl, credentials)=>(method, opts={}, path="") =>{
  const defaults={credentials:credentials, options:{}}
  const params = Object.assign({}, defaults, opts)
  let _path = path
  let basePath = opts.basePath || rootUrl
  if(path){
    _path = '/'+path
  }
  const request= Object.assign({},
    {
      method: method,
      url: basePath + _path,
      credentials: params.credentials
    },
    params.options 
  )  
  return request
}
exports.routeRequest = routeRequest