const jwt = require('jsonwebtoken')
const User = require('../models/user')

const auth = async (req, res, next) => {
    try{
        const token = req.header("Authorization").split(' ')[1] //Get users token from the header. This was set by 'user.generateAuthToken()'
        const payload = await jwt.verify(token, process.env.SECRET_ACCESS_KEY) //decode the token which returns an object with the users id.
        const user = await User.findOne({_id: payload._id.toString(), 'tokens.token': token}) //Get the user using that returned object ID

        if(!user){
            throw new Error()
        }

        req.token = token //Attaching the token and user to the request object before it gets passed to the route handler
        req.user = user
    
        next()//Tells middleware to move on to the route handler
    }catch(e){
        res.status(401).send({message: 'Please Authenticate'})
    }
}

module.exports = auth