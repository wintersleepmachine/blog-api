const express = require('express')
const router = new express.Router()
const Blog = require('../models/blog')
const auth = require('../middleware/auth')
const multer = require('multer')

const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb){
        if(!file.originalname.match(/\.(jpg|jpeg|png)$/)){
            return cb(new Error('Please upload a jpg, jpeg or png file.'))
        }

        return cb(undefined, true)
    }
})


//Creating new blog post
router.post('/blogs', auth, upload.single('picture'), async (req, res) => {
    const blog = new Blog({
        ...req.body,
        owner: req.user._id,
        votes: 0
    })

    try {
        await blog.save()
        res.status(201).send(blog)
    }catch(e){
        res.status(500).send(e)
    }
}, (error, req, res, next) => {
    res.send({message: error.message})
})

//Get all blogs that belong to that user
router.get('/blogs/me', auth, async (req, res) => {
    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        const blogs = await Blog.find({owner: req.user._id}).limit(req.query.limit).sort(sort)
        res.send(blogs)
    }catch(e){
        res.status(500).send(e)
    }
})

// Get all blogs user is subscribed to
// '/blogs?limit=2'
// /blogs?sortBy=createdAt:desc
router.get('/blogs', auth, async (req, res) => {
    const sort = {}
    if(req.query.sortBy){
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        const blogs = await Blog.find({owner:{$in: req.user.subscribedTo}}).limit(parseInt(req.query.limit)).sort(sort) //Get all blogs with an array of user ids. 
                                                                                                                        //using a query to limit amount back
        res.send(blogs)
    }catch(e){
        res.status(500).send(e)
    }
}) 


//Get individual blog
router.get('/blogs/:id', auth, async (req, res) => {
    const {id} = req.params

    try {
        const blog = await Blog.findById(id)
        if(!blog){
            res.status(404).send('Blog not found')
        }

        res.send(blog)
    }catch(e){
        res.status(500).send(e)
    }
})

//Update one of users own blog
router.patch('/blogs/:id', auth, async (req, res) => {
    const {id} = req.params

    //This block sees if updates valid operations
    const updates = Object.keys(req.body)
    const allowedUpdates = ['title', 'description', 'votes']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if(!isValidOperation){
        res.status(400).send('Invalid Updates')
    }

    try {
        const blog = await Blog.findOne({_id: id, owner: req.user._id})
        if(!blog){
            res.status(404).send('Blog not found')
        }

        updates.forEach((update) => blog[update] = req.body[update])
        await blog.save()
        res.send(blog)
    }catch(e){
        res.status(500).send(e)
    }
})

//Deleting an individual own blog
router.delete('/blogs/:id', auth, async(req, res) => {
    const {id} = req.params
    try {
        const blog = await Blog.findOneAndDelete({_id: id, owner: req.user._id})
        if(!blog){
            res.status(404).send('No blog found')
        }

        res.send(blog)
    }catch(e){
        res.status(500).send(e)
    }
})

module.exports = router 