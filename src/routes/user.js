const express = require('express')
const User = require('../models/user')
const auth = require('../middleware/auth')
const multer = require('multer')

const router = new express.Router()

//Signing up users
router.post('/users/sign-up', async (req, res) => {
    const user = new User(req.body)
    try{
        const token = await user.generateAuthToken() //This will generate a jwt and add it to the newly created users array
        await user.save()
        res.status(201).send({user, token})
    }catch(e){
        res.status(500).send(e)
    }
})

//Login in users
router.post('/users/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password) //Finds user by email first, then compares the typed password to the hashed password. Returns user if match.
        const token = await user.generateAuthToken()

        res.send({user, token})
    }catch(e){
        res.status(500).send(e)
    }
    
})

// Logging out user
router.post('/users/logout', auth, async(req, res) => {
    try {   
        req.user.tokens = req.user.tokens.filter((token) => { //Deleting the specific token from the users token array
            return token.token !== req.token
        })

        await req.user.save()
        res.status(200).send('Sucessfully logged out')
    }catch(e){
        res.status(500).send(e)
    }
})

//Logout All
router.post('/users/logout-all', auth, async (req, res) => {
    try {
        req.user.tokens = [] //Deleting all the tokens from the users array
        await req.user.save()

        res.status(200).send({message: 'Sucessfully logged out of all devices'})
    }catch(e){
        res.status(500).send(e)
    }
})

//Get logged in users profile
router.get('/users/me', auth, async (req, res) => {
    try{
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})

//Get another users profile
router.get('/users/:id', auth, async (req, res) => { //user must be logged in and authenticted first before making this request
    const {id} = req.params

    try {
        const user = await User.findById(id)
        res.send(user)
    }catch(e){
        res.status(500).send(e)
    }
})

//updating individual users own profile. 
router.patch('/users/me', auth, async (req, res) => {
    
    //This is block is to determine whether the updates are valid
    const updates = Object.keys(req.body)
    const allowedUpdates = ['username', 'email', 'password', 'aboutMe', 'subscribedTo']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        res.status(400).send('Invalid updates')
    }

    try{
        //Updating the user property from the req.body object
        updates.forEach((update) => {
            if(update === 'subscribedTo' && !req.user.subscribedTo.includes(req.body[update])){ //Adding user ObjectIds to subscribedTo array.
                req.user.subscribedTo = [...req.user.subscribedTo, req.body[update]]
            }else if(update === 'subscribedTo' && req.user.subscribedTo.includes(req.body[update])){
                return ;
            }else{
                req.user[update] = req.body[update] //Updating any other property
            }
        })

        await req.user.save()

        res.send(req.user)

    }catch(e){
        res.status(500).send(e)
    }

})

//Deleting a user //Deleting yourself
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove()
        res.send(req.user)
    }catch(e){
        res.status(500).send(e)
    }
})



const upload = multer({
    // dest: 'avatars', //Removing this line will cause multer not to save the avatar to a folder in our directory instead pass it off as data to our route handler, which is accessible on req.file
    limits: {
        fileSize: 1000000 //In bytes therefore 1mb
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){ //This make sures to only accept jpg, jpeg, png
            return cb(new Error('Please upload a jpg, jpeg or png file'))
        }

        return cb(undefined, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async(req, res) => {
    req.user.avatar = req.file.buffer //req.file.buffer is only avalible if the dest path is not there.
    await req.user.save()
    res.send()    
}, (error, req, res, next) => {
    res.status(400).send({error: error.message})
}) //third callback function will handle errors and return them as json format, as opposed to HTML like before.


router.delete('/users/me/avatar', auth, async(req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

//

module.exports = router 