'use strict'

const Boom = require('boom')
const Lock = require("../models/lock")

const noContent = (reply)=> reply.response().code(204)

const getLockWithAuth = async(cond)=>{
   const userId = request.auth.credentials.id
   const lock = await Lock.where(cond).fetch()
   console.log('got lock',lock)
   if (!lock){
    throw Boom.notFound("Lock does not exist")
   } else {
     if(lock.get('userId') != userId){
        throw Boom.forbidden("Lock must belong to you")
     }
   }
  return lock 
}
const patchLock = async(request, reply) => {
   const lock = await getLockWithAuth({id:lockId})
   const payload = request.payload
   const patched = await lock.patch(payload)
   return  patched
}

const getLocks = async(request, reply) => {
   const userId = request.auth.credentials.id 
   const locks = await Lock.where({userId: userId}).fetchAll()
   return locks
}

const getLock = async(request, reply) =>  { 
   const lockId = request.params.id
   const lock = await getLockWithAuth({id:lockId})   
   return lock
}

const getLockByMacId = async(request, reply) =>  {  
   const macId = request.params.macId
   const lock = await getLockWithAuth({macId:macId})
   return lock
}

const createLock = async (request, reply) => {
   const lock = await Lock.create({name:request.payload.name, userId:request.auth.credentials.id})
   return lock
}

const deleteLock = async(request, reply) => {
   const lock = await getLockWithAuth({id:lockId})
   await lock.destroy()
   return noContent(reply)
}

const verifyNameUserIdUnique = async (request, reply) =>{
  const lockParams = {name:request.payload.name, userId:request.auth.credentials.id}
  const alreadyExists = await Lock.where(lockParams).fetch()
  if (alreadyExists){
     return reply.response('Lock name is taken ').code(422).takeover()
  }
  return reply.continue
}

module.exports={
    createLock: createLock,
    verifyNameUserIdUnique: verifyNameUserIdUnique,
    deleteLock: deleteLock,
    getLocks: getLocks,
    getLock: getLock,
    getLockByMacId: getLockByMacId,
    patchLock: patchLock
}
