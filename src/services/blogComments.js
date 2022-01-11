import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getBlogPosts, postBlogPost } from '../library/fs-tools.js'

const blogCommentsRouter = express.Router({ mergeParams: true })

//endpoints
blogCommentsRouter.post('/', async (req, res, next) => {
    try {
        const blogPosts = await getBlogPosts()
        const currentBlogPost = blogPosts.find(post => post.id === req.params.postId)
        const newComment = { ...req.body, createdAt: new Date(), id: uuidv4() }
        if (currentBlogPost.comments) {
            currentBlogPost.comments.push(newComment)
        } else {
            currentBlogPost.comments = []
            currentBlogPost.comments.push(newComment)
        }
        blogPosts.push(currentBlogPost)
        await postBlogPost(blogPosts)
        res.status(201).send(`Comment added successfully to blog post with id ${ req.params.postId }`)
    } catch (error) {
        next(error)
    }
})

blogCommentsRouter.get('/', async (req, res, next) => {
    try {
        const blogPosts = await getBlogPosts()
        const currentBlogPost = blogPosts.find(post => post.id === req.params.postId)
        const blogPostComments = currentBlogPost.comments
        res.send(blogPostComments)
    } catch (error) {
        next(error)
    }
})



export default blogCommentsRouter