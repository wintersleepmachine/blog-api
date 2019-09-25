const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate(value){ //Using validatorjs to determine if value is email
            if(!validator.isEmail(value)){
                throw new Error('Email not valid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate(value){
            if(value.toLowerCase().includes('password')){
                throw new Error('Password must not contain the word "password"')
            }
        }
    },
    aboutMe: {
        type: String,
        trim: true,
        default: 'About me...'
    },
    subscribedTo: [ //User will store an array of user IDs the logged in user is subscribed to. 
        {type:mongoose.Schema.Types.ObjectId}
    ],
    tokens: [{ //Array of stored tokens.
        token:{
            type:String,
            required: true
        }
    }],
    avatar: {type: Buffer}

}, {timestamps: true})


//Logging in user.
userSchema.statics.findByCredentials = async (email, password) => {
    try{
        const user = await User.findOne({email})// First find user by the email

        if(!user){
            res.status(404).send('Invalid credentials') //Give minimal information as possible
        }

        const isMatch = await bcrypt.compare(password, user.password) // Next compare if users input password matches the hashed password stored int he database

        if(!isMatch){
            res.status(403).send('Invalid Credentials')//Give minimal information as possible
        }
        return user

    }catch (e){
        res.status(500).send(e)
    }
}


//Generating Auth token and attaching it to the users tokens array
userSchema.methods.generateAuthToken = async function(){
    const user = this

    try{
        const token = jwt.sign({_id: user._id}, process.env.SECRET_ACCESS_KEY) //generating a token for the user
        
        user.tokens.push({token}) //pushing the token onto the tokens array
        await user.save()

        return token //returning the token
    }catch(e){
        res.status(500).send(e)
    }
}

// The users password is modifed during two events: Creating a user AND a user updating their password.
userSchema.pre('save', async function(req, res, next){ 
    const user = this

    if(user.isModified('password')){
        user.password = await bcrypt.hash(user.password, 8) //Hash the typed password and setting the user.password property to the hashed value
    }

    next()
})

userSchema.methods.toJSON = function(){ //Whenever res.send() is called, mongoose calls toJSON behind the scenes. Here we can modify the object before it 
                                        //is converted to JSON.
    const user = this
    const userObj = user.toObject()

    delete userObj.password
    delete userObj.tokens

    return userObj
}

const User = new mongoose.model('User', userSchema)


module.exports = User