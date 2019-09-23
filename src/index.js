//8181
//ilovebreka

//Send back public profile data, not including password, tokens, etc => DONE
//View another persons public profile => DONE
//Add owner property to blog model => DONE
//Set up route for user to get all their own blogs => DONE

//Get blogs from all owners the user is subscribed to 

//add Auth to all needed routes => DONE
//Set up route to get another users profile => DONE
//updating yourself. new route => router.patch(/users/me) => DONE
//Deleting yourself. new route => router.delete(/users/me) => DONE
//Updating and deleting your own blogs => DONE
//hide jwt secret key in env file


const mongoose  = require('mongoose')
const express = require('express')
const app = express()
const userRouter = require('./routes/user')
const blogRouter = require('./routes/blog')

require('dotenv').config()

const PORT  = 3000 || process.env.port
const db = mongoose.connection

mongoose.connect(process.env.DATABASE_URL, {useNewUrlParser:true, useUnifiedTopology: true, useCreateIndex: true})
db.on('error', (err) => console.log(err))
db.once('open', () => console.log('Connected to database'))

app.use(express.json())
app.use(userRouter)
app.use(blogRouter)

app.listen(PORT, () => {
    console.log('Server is up on ' + PORT)
})