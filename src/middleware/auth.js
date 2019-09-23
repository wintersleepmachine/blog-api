const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try{
        const token = req.header("Authorization").split(' ')[1]
        const payload = await jwt.verify(token, process.env.SECRET_ACCESS_KEY)
        const user = await User.findOne({_id: payload._id.toString(), 'tokens.token': token})

        if(!user){
            throw new Error()
        }

        req.token = token
        req.user = user
    
        next()
    }catch(e){
        res.status(401).send({message: 'Please Authenticate'})
    }
}

module.exports = auth