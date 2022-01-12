import express from 'express'
import BlogPostsModel from '../blogPosts/schema.js'
import blogCommentsModel from './schema.js'
import { v4 as uuidv4 } from 'uuid'
import { getBlogPosts, postBlogPost } from '../../library/fs-tools.js'

const blogCommentsRouter = express.Router({ mergeParams: true })

//endpoints
blogCommentsRouter.post('/', async (req, res, next) => {
    try {
        const commentToAdd = new blogCommentsModel({ ...req.body, createdAt: new Date() })
        const editedBlogPost = await BlogPostsModel.findByIdAndUpdate(req.params.postId, { $push: { comments: commentToAdd } }, { new: true })
        if (editedBlogPost) {
            res.status(201).send(`Comment added successfully to blog post with id ${ req.params.postId }`)
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogCommentsRouter.get('/', async (req, res, next) => {
    try {
        const blogPost = await BlogPostsModel.findById(req.params.postId)
        if (blogPost) {
            res.send(blogPost.comments)
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogCommentsRouter.get('/:commentId', async (req, res, next) => {
    try {
        const blogPost = await BlogPostsModel.findById(req.params.postId)
        if (blogPost) {
            const selectedComment = blogPost.comments.find(comment => comment._id.toString() === req.params.commentId)
            if (selectedComment) {
                res.send(selectedComment)
            } else {
                next(createHttpError(404, `Comment with id ${ req.params.commentId } does not exist or has been deleted.`))
            }
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogCommentsRouter.put('/:commentId', async (req, res, next) => {
    try {
        const blogPost = await BlogPostsModel.findById(req.params.postId)
        if (blogPost) {
            const commentIndex = blogPost.comments.findIndex(comment => comment._id.toString() === req.params.commentId)
            if (commentIndex !== -1) {
                console.log(blogPost.comments[commentIndex])
                blogPost.comments[commentIndex] = { ...blogPost.comments[commentIndex], ...req.body, updatedAt: new Date() }
                await blogPost.save()
                res.send(blogPost)
            } else {
                next(createHttpError(404, `Comment with id ${ req.params.commentId } does not exist or has been deleted.`))
            }
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogCommentsRouter.delete('/:commentId', async (req, res, next) => {
    try {
        const blogPostToRemoveCommentFrom = await BlogPostsModel.findByIdAndUpdate(req.params.postId, { $pull: { comments: { _id: req.params.commentId } } }, { new: true })
        if (blogPostToRemoveCommentFrom) {
            res.send(blogPostToRemoveCommentFrom)
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

export default blogCommentsRouter