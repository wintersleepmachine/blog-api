//8181
//ilovebreka

//Send back public profile data, not including password, tokens, etc => DONE
//View another persons public profile => DONE
//Add owner property to blog model => DONE
//Set up route for user to get all their own blogs => DONE
//Get blogs from all owners the user is subscribed to => DONE
//add Auth to all needed routes => DONE
//Set up route to get another users profile => DONE
//updating yourself. new route => router.patch(/users/me) => DONE
//Deleting yourself. new route => router.delete(/users/me) => DONE
//Updating and deleting your own blogs => DONE
//hide jwt secret key in env  => DONE

//set up a route so users can upload an profile avatar picture
//Add picture to blog model
//set up post route to creating a blog and adding a picture if they want.


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

//

// const multer = require('multer')
// const upload = multer({ //initializes multer to an instance of upload. Will create a folder called 'images' and store all images in that folder
//     dest:'images',
//     limits: {
//         fileSize: 1000000
//     },
//     fileFilter(req, file, cb){
//         // if(!file.originalname.endsWith('pdf')){
//         //     return cb(new Error('please upload a pdf'))
//         // }

//         if(!file.originalname.match(/\.(doc|docx)$/)){
//             return cb(new Error('Please upload a word doc'))
//         }

//         return cb(undefined, true)

//         // cb(new Error('file must be')) //if things go badly we send an error
//         // cb(undefined, true)//If things go well we provide boolean as second argument
//     }
// })

// app.post('/upload', upload.single('upload'), (req, res) => { //the argument passed into upload.single() must match the key in the body form-data
//     res.send()
// })


//

app.listen(PORT, () => {
    console.log('Server is up on ' + PORT)
})

