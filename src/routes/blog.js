const express = require('express')
const router = new express.Router()
const Blog = require('../models/blog')
const auth = require('../middleware/auth')

//Creating new blog post
router.post('/blogs', auth, async (req, res) => {
    const blog = new Blog({
        ...req.body,
        owner: req.user._id
    })

    try {
        await blog.save()
        res.status(201).send(blog)
    }catch(e){
        res.status(500).send(e)
    }
})

//Get all blogs that belong to that user
router.get('/blogs/me', auth, async (req, res) => {
    try {
        const blogs = await Blog.find({owner: req.user._id})
        res.send(blogs)
    }catch(e){
        res.status(500).send(e)
    }
})


// NEED TO FINISH

// Get all blogs user is subscribed to
router.get('/blogs', auth, async (req, res) => {
    let blogs = []
    try {
        req.user.subscribedTo.forEach(async (id) => {
            const ownersBlogs = await Blog.find({owner:id})
            blogs = [...blogs, ...ownersBlogs]
        })
        console.log(blogs)
        res.send(blogs)
    }catch(e){
        res.status(500).send(e)
    }
}) 

//

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
    const allowedUpdates = ['title', 'description']
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

//Deleting an indavidual own blog
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