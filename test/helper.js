const { expect } = require('code');

const itShouldRequireAuthentication = function(server, request){
  return async()=>{
    const response = await server.inject(request)
    expect(response.result.statusCode).to.equal(401)
  }
}

exports.itShouldRequireAuthentication = itShouldRequireAuthentication