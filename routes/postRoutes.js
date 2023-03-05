const express = require('express')
const dotenv = require('dotenv')
const cloudinary = require('cloudinary').v2

const Post = require('../mongodb/models/post')

dotenv.config()

const router = express.Router()

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
})

// GET ALL POSTS
router.route('/').get(async(req, res) => {
    try {
        const posts = await Post.find({})

        res.status(200).json({success: true, data: posts})
    } catch (error) {
        res.status(500).json({ success: false, errMessage: error})
    }
})
// CREATE A POST
router.route('/').post(async(req, res) => {
    try {
        const { prompt, photo } = req.body
        const photoUrl = await cloudinary.uploader.upload(photo)

        const newPost = await Post.create({
            // name,
            prompt,
            photo: photoUrl.url,
        })

        res.status(201).json({success: true, data: newPost})
    } catch (error) {
        res.status(500).json({ success: false, errMessage: error})
    }
})

// DELETE A POST
router.route('/delete').post(async (req, res) => {
    try {
        const { prompt, photo, photoId } = req.body
        const deletePost = await Post.find({ photo })
        const { _id: postId } = deletePost[0]
        console.log(postId)

        const deletePostId = await Post.deleteOne({ _id: postId })
        console.log(deletePostId)

        // const findPublicId = await cloudinary.search
        // .expression(photoId)
        // .sort_by('public_id', 'desc')
        // .execute()
        // console.log(findPublicId)

        const deletePublicId = await cloudinary.uploader.destroy(photoId)
        console.log(deletePublicId)

        res.status(201).json({success: true, message: 'image deleted', data: {deletePostId, deletePublicId}})
    } catch (error) {
        res.status(500).json({ success: false, errMessage: error})
    }
})

module.exports = router