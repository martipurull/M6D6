import express from 'express'
import BlogPostModel from './schema.js'
import BlogCommentModel from '../blogComments/schema.js'
import { validationResult } from 'express-validator'
import { blogPostsValidation } from '../blogPostValidation.js'
import createHttpError from 'http-errors'
import q2m from 'query-to-mongo'

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
        const mongoQuery = q2m(req.query)
        const noOfPosts = await BlogPostModel.countDocuments(mongoQuery.criteria)
        const blogPosts = await BlogPostModel.find(mongoQuery.criteria)
            .limit(mongoQuery.options.limit)
            .skip(mongoQuery.options.skip)
            .sort(mongoQuery.options.sort)
            .populate({ path: "author", select: "firstName lastName" })
        res.send({ link: mongoQuery.links('/blogPosts', noOfPosts), pageTotal: Math.ceil(noOfPosts / mongoQuery.options.limit), noOfPosts, blogPosts })
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get('/:postId', async (req, res, next) => {
    try {
        const foundBlogPost = await BlogPostModel.findById(req.params.postId).populate({ path: "author", select: "firstName lastName email" })
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
            next(createHttpError(404, `Blog post with id ${ req.params.postId } did not exist or had already been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

//comments endpoints
blogPostsRouter.post('/:postId', async (req, res, next) => {
    try {
        const uploadedComment = await new BlogCommentModel(req.body)
        const commentToAdd = { ...uploadedComment.toObject(), createdAt: new Date() }
        const blogPostToAddCommentTo = await BlogPostModel.findByIdAndUpdate(req.params.postId, { $push: { comments: commentToAdd } }, { new: true })
        if (blogPostToAddCommentTo) {
            res.send(blogPostToAddCommentTo)
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get('/:postId/comments', async (req, res, next) => {
    try {
        const blogPost = await BlogPostModel.findById(req.params.postId)
        if (blogPost) {
            res.send(blogPost.comments)
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

// blogPostsRouter.get('/:postId/comments', async (req, res, next) => {
//     try {
//         const blogPostComments = await BlogPostModel.find({ _id: req.params.postId }, { comments: { $slice: 2 } })
//         if (blogPostComments) {
//             res.send(blogPostComments)
//         } else {
//             next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
//         }
//     } catch (error) {
//         next(error)
//     }
// })

blogPostsRouter.get('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const blogPost = await BlogPostModel.findById(req.params.postId)
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

blogPostsRouter.put('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const blogPost = await BlogPostModel.findById(req.params.postId)
        if (blogPost) {
            const commentIndex = blogPost.comments.findIndex(comment => comment._id.toString() === req.params.commentId)
            if (commentIndex !== -1) {
                const commentToEdit = { ...blogPost.comments[commentIndex].toObject(), ...req.body, updatedAt: new Date() }
                blogPost.comments[commentIndex] = commentToEdit
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

blogPostsRouter.delete('/:postId/comments/:commentId', async (req, res, next) => {
    try {
        const modifiedBlogPost = await BlogPostModel.findByIdAndUpdate(req.params.postId, { $pull: { comments: { _id: req.params.commentId } } }, { new: true })
        if (modifiedBlogPost) {
            res.send(modifiedBlogPost)
        } else {
            next(createHttpError(404, `Blog post with id ${ req.params.postId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

export default blogPostsRouter