'use strict'

const route = require('../utils/route')
var namespace = require('hapi-namespace')
const status = require('../utils/routeResponses')
const Joi = require('joi')

const usernamePassword = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required()
})
module.exports = namespace('/users', [
    route('', "POST", "Sign Up", 
          "Creates a new user with username and password",{
        payload: usernamePassword
    },
     {responses: status.signupHttpStatus, insecured:true}
    ),
    route('', "GET", "Get Users", 
         "Returns list of other users",{},
         {responses: status.usersHttpStatus}
    ) ,
    route('/{id}', "GET", "GET user by id", 
         "Returns a user fetched by id",{
          params:{id: Joi.number().integer()}
        },
       {responses: status.userHttpStatus}
     ),
    route('/username/{username}', "GET", "Get user by username",
          "Returns a user fetched by username",{
          params:{username: Joi.string()}
        },
       {responses: status.userHttpStatus}
     )
]).concat(namespace("/users/me",[
  route("","PUT", "Update user", 
    "replaces authorized user or creates new user; when replacing user throws error if any attribute other than name/birthDate are different",{
      payload: status.models.user
    },
    {responses: status.userHttpStatus}
   ),  
  route("","PATCH", "Patch user", 
    "updates authorized user; throws error if changes are not one of birthDate or name",{
      payload: { name: Joi.string(), birthDate: Joi.date()}
    },
    {responses: status.userHttpStatus}
  ),  
  route("", "DELETE", "Delete authorized user", 
       "Logs out and deletes authorized user from system",{},
      {responses: status.defaultHttpStatus}
   ),
  route("", "GET", "Get self information", "Returns authorized user's model",{},
    {responses: status.userHttpStatus}
  )
]
)).concat(route("/login", "POST", "Login", "returns access token if credentials are valid otherwise an error",{
     payload:usernamePassword
  },    
  {responses: status.loginHttpStatus, insecured:true}
))