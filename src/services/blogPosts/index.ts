import express, { NextFunction, Request, Response } from 'express'
import BlogPostModel from './schema.js'
import BlogCommentModel from '../blogComments/schema.js'
import AuthorModel from '../authors/schema.js'
import { validationResult } from 'express-validator'
import { blogPostsValidation } from '../blogPostValidation.js'
import createHttpError from 'http-errors'
import q2m from 'query-to-mongo'
import { basicAuth } from '../../auth/basicAuth.js'
import { adminAuth } from '../../auth/adminAuth.js'
import { IBlogComment } from '../../types/commentInterface.js'
import { parser, cloudinary } from '../../utils/cloudinary.js'

const blogPostsRouter = express.Router()

//endpoints
blogPostsRouter.post('/', parser.single('blogPostImage'), basicAuth, blogPostsValidation, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const errorList = validationResult(req)
        if (!errorList.isEmpty()) {
            next(createHttpError(400, "There some errors on your submission, namely: ", { errorList }))
        } else {
            const newBlogPost = new BlogPostModel(req.body)
            newBlogPost.cover = req.file?.path
            newBlogPost.filename = req.file?.filename
            await newBlogPost.save()
            res.status(201).send(newBlogPost)
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
            .populate({ path: "authors", select: "firstName lastName" })
        res.send({ link: mongoQuery.links('/blogPosts', noOfPosts), pageTotal: Math.ceil(noOfPosts / mongoQuery.options.limit), noOfPosts, blogPosts })
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get('/:postId', async (req, res, next) => {
    try {
        const foundBlogPost = await BlogPostModel.findById(req.params.postId).populate({ path: "authors", select: "firstName lastName email" })
        if (foundBlogPost) {
            res.send(foundBlogPost)
        } else {
            next(createHttpError(404, `Blog post with id ${req.params.postId} does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.put('/:postId', parser.single('blogPostImage'), basicAuth, adminAuth, async (req, res, next) => {
    try {
        const oldBlogPost = await BlogPostModel.findById(req.params.postId)
        const body = { ...req.body, cover: req.file?.path || oldBlogPost.cover, filename: req.file?.filename || oldBlogPost.filename }
        const editedBlogPost = await BlogPostModel.findByIdAndUpdate(req.params.postId, body, { new: true })
        if (!editedBlogPost) return next(createHttpError(404, 'This blog post does no longer exist and cannot be edited'))
        if (oldBlogPost && req.file) {
            await cloudinary.uploader.destroy(oldBlogPost.filename)
        }
        res.send(editedBlogPost)
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.delete('/:postId', basicAuth, adminAuth, async (req, res, next) => {
    try {
        const deletedBlogPost = await BlogPostModel.findByIdAndDelete(req.params.postId)
        if (!deletedBlogPost) return next(createHttpError(404, `Blog post with id ${req.params.postId} did not exist or had already been deleted.`))
        if (deletedBlogPost.filename) {
            await cloudinary.uploader.destroy(deletedBlogPost.filename)
        }
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

//comments endpoints
blogPostsRouter.post('/:postId', basicAuth, async (req, res, next) => {
    try {
        const uploadedComment = await new BlogCommentModel(req.body)
        const commentToAdd = { ...uploadedComment.toObject(), createdAt: new Date() }
        const blogPostToAddCommentTo = await BlogPostModel.findByIdAndUpdate(req.params.postId, { $push: { comments: commentToAdd } }, { new: true })
        if (blogPostToAddCommentTo) {
            res.send(blogPostToAddCommentTo)
        } else {
            next(createHttpError(404, `Blog post with id ${req.params.postId} does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get('/:postId/comments', basicAuth, async (req, res, next) => {
    try {
        const mongoQuery = q2m(req.query)
        const blogPostComments = await BlogPostModel.find({ _id: req.params.postId }, { comments: { $slice: mongoQuery.options.limit } })
        if (blogPostComments) {
            res.send(blogPostComments)
        } else {
            next(createHttpError(404, `Blog post with id ${req.params.postId} does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get('/:postId/comments/:commentId', basicAuth, async (req, res, next) => {
    try {
        const blogPost = await BlogPostModel.findById(req.params.postId)
        if (blogPost) {
            const selectedComment = blogPost.comments.find((comment: IBlogComment) => comment._id.toString() === req.params.commentId)
            if (selectedComment) {
                res.send(selectedComment)
            } else {
                next(createHttpError(404, `Comment with id ${req.params.commentId} does not exist or has been deleted.`))
            }
        } else {
            next(createHttpError(404, `Blog post with id ${req.params.postId} does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.put('/:postId/comments/:commentId', basicAuth, adminAuth, async (req, res, next) => {
    try {
        const blogPost = await BlogPostModel.findById(req.params.postId)
        if (blogPost) {
            const commentIndex = blogPost.comments.findIndex((comment: IBlogComment) => comment._id.toString() === req.params.commentId)
            if (commentIndex !== -1) {
                const commentToEdit = { ...blogPost.comments[commentIndex].toObject(), ...req.body, updatedAt: new Date() }
                blogPost.comments[commentIndex] = commentToEdit
                await blogPost.save()
                res.send(blogPost)
            } else {
                next(createHttpError(404, `Comment with id ${req.params.commentId} does not exist or has been deleted.`))
            }
        } else {
            next(createHttpError(404, `Blog post with id ${req.params.postId} does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.delete('/:postId/comments/:commentId', basicAuth, adminAuth, async (req, res, next) => {
    try {
        const modifiedBlogPost = await BlogPostModel.findByIdAndUpdate(req.params.postId, { $pull: { comments: { _id: req.params.commentId } } }, { new: true })
        if (modifiedBlogPost) {
            res.send(modifiedBlogPost)
        } else {
            next(createHttpError(404, `Blog post with id ${req.params.postId} does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

//likes endpoints
blogPostsRouter.post('/:postId/:userId/likes', basicAuth, async (req, res, next) => {
    try {
        const user = await AuthorModel.findById(req.params.userId)
        if (user) {
            const doesUserLikePost = await BlogPostModel.findOne({ likes: req.params.userId })
            if (doesUserLikePost) {
                res.send(`You already like blog post with id ${req.params.postId}`)
            } else {
                const likedBlogPost = await BlogPostModel.findByIdAndUpdate(req.params.postId, { $push: { likes: user._id } })
                if (likedBlogPost) {
                    res.send(`You like blog post with id ${req.params.postId}`)
                } else {
                    next(createHttpError(404, `Blog post with id ${req.params.postId} does not exist or has been deleted.`))
                }
            }
        } else {
            next(createHttpError(404, `User with id ${req.params.userId} does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

blogPostsRouter.get('/:postId/likes', async (req, res, next) => {
    try {
        const blogPost = await BlogPostModel.findById(req.params.postId)
        if (blogPost && blogPost.totalLikes < 1) {
            res.send('Be the first one to like this post')
        } else if (blogPost && blogPost.totalLikes === 1) {
            res.send(`${blogPost.totalLikes} person likes this blog post.`)
        } else if (blogPost && blogPost.totalLikes > 1) {
            res.send(`${blogPost.totalLikes} people like this blog post.`)
        } else {
            next(createHttpError(404, `Blog post with id ${req.params.postId} does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

export default blogPostsRouter