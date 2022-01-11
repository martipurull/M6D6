import express from 'express'
import BlogPostModel from './schema.js'
import { validationResult } from 'express-validator'
import { blogPostsValidation } from '../blogPostValidation.js'
import createHttpError from 'http-errors'
import { getBlogPosts, postBlogPost } from '../../library/fs-tools.js'

const blogPostsRouter = express.Router()

//endpoints
blogPostsRouter.post('/', blogPostsValidation, async (req, res, next) => {
    try {
        const errorList = validationResult(req)
        if (!errorList.isEmpty()) {
            next(createHttpError(400, "There some errors on your submission, namely: ", { errorList }))
        } else {
            const newBlogPost = new BlogPostModel(req.body)
            await newBlogPost.save()
            res.status(201).send({ id: newBlogPost._id })
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get('/', async (req, res, next) => {
    try {
        const blogPosts = await BlogPostModel.find()
        if (req.query && req.query.title) {
            const filteredPosts = blogPosts.filter(post => post.title.includes(req.query.title))
            res.send(filteredPosts)
        } else {
            res.send(blogPosts)
        }
        res.send(blogPosts)
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get('/:postId', async (req, res, next) => {
    try {
        const foundBlogPost = await BlogPostModel.findById(req.params.postId)
        if (foundBlogPost) {
            res.send(foundBlogPost)
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.put('/:postId', async (req, res, next) => {
    try {
        const editedBlogPost = await BlogPostModel.findByIdAndUpdate(req.params.postId, req.body, { new: true })
        if (editedBlogPost) {
            res.send(editedBlogPost)
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.delete('/:postId', async (req, res, next) => {
    try {
        const deletedBlogPost = await BlogPostModel.findByIdAndDelete(req.params.postId)
        if (deletedBlogPost) {
            res.status(204).send()
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has already been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})



export default blogPostsRouter