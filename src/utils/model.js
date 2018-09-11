const reject = (reason)=>{
    return Promise.reject(new Error(reason))
}

exports.reject = reject