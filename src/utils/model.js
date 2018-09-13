const reject = (reason)=>{
    let err = reason
    if (!err.isBoom){
        err = new Error(reason)
    } 
    return Promise.reject(err)
}

exports.reject = reject