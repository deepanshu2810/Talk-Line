const mongoose = require('mongoose')
const { Post, User } = require('../../models')
const { catchAsync } = require('../../utils')

exports.createPost = catchAsync(async(req, res) => {

    if (!req.body.title || !req.body.description) return res.json({ success: false, message: 'Title and description are required' })

    // create the post
    const post = await Post.create({
        title: req.body.title,
        description: req.body.description,
        owner: req.headers._id,
        date: new Date().toUTCString(),
        likes: 0,
        comments: []
    })

    // Add the post to the list of posts by the user
    const user = await User.findOne({ _id: req.headers._id })
    user.posts.push(post._id)
    await user.save()

    return res.json({ success: true, data: { post } })

})

exports.deletePost = catchAsync(async(req, res) => {

    if (!req.params.id) return res.json({ success: false, message: 'Post ID is required' })

    const post = await Post.findOne({ _id: req.params.id })
    if (!post) return res.json({ success: false, message: 'Post not found' })

    await Post.deleteOne({ _id: req.params.id })

    //Remove the deleted post from the list of posts by the users
    const user = await User.findOne({ _id: req.headers._id })
    user.posts = user.posts.filter(id => !mongoose.Types.ObjectId(id).equals(mongoose.Types.ObjectId(req.params.id)))
    await user.save()

    return res.json({ success: true, message: 'Post deleted successfully' })
})