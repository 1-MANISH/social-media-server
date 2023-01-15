
const success  = (statusCode,rejult) =>{

    return{
        status:'ok',
        statusCode,
        rejult
    }

}

const error = (statusCode,message) =>{

    return{
        status:'error',
        statusCode,
        message
    }

}

module.exports ={
    success,
    error
}