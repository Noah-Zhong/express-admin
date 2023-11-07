function send(res, data, status, message){
    if(status == 200){
        res.status(status).send({
            code: status,
            data,
            message: message || 'success'
        })
    }else{
        res.status(status).send({
            code: status,
            data,
            message: message || 'failure'
        })
    }
}

module.exports = send;