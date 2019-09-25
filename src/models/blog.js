const mongoose = require('mongoose')

const blogSchema = new mongoose.Schema({
    title: {
        type: String, 
        required: true, 
        trim: true
    },
    description: {
        type: String,
        required: true,
        trim: true
    }, 
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    picture: {
        type: Buffer
    },
    votes: {
        type: Number,
        default: 0
    }
}, {timestamps: true})

const Blog = new mongoose.model('Blog', blogSchema)

module.exports = Blog