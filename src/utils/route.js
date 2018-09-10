'use strict';

let order = 0

function route(path, method, description, notes, validation={}, opts={}){
    order += 1
    const validate = Object.assign({}, validation)
    const responses = opts.responses || []
    const _notes = [notes]
    if (!opts.insecured) {
      _notes.push('__Token is required to access this endpoint.__')
    }
    return {
        path: path,
        method: method,
        config:{
            tags:["api"],
            description: description,
            notes: _notes,
            plugins: {
               'hapi-swagger': {
                 order: order,
                 responses: responses
               }
            } ,
            validate: validate,
            handler: (request, reply) => "Not Implemented"
        }
    }
 }

 module.exports = route