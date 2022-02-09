import express, { NextFunction, Request, Response } from 'express'
import AuthorModel from './schema'
import BlogPostsModel from '../blogPosts/schema'
import createHttpError from 'http-errors'
import { basicAuth } from '../../auth/basicAuth'
import { adminAuth } from '../../auth/adminAuth'
import { cloudinary, parser } from '../../utils/cloudinary'

const authorsRouter = express.Router()

authorsRouter.post('/', parser.single('authorAvatar'), basicAuth, adminAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { firstName, lastName } = req.body
        const newAuthor = new AuthorModel({
            ...req.body,
            avatar: req.file?.path || `https://ui-avatars.com/api/?name=${firstName}+${lastName}`,
            filename: req.file?.filename
        })
        await newAuthor.save()
        res.status(201).send(newAuthor)
    } catch (error) {
        next(error)
    }
})

authorsRouter.get('/', basicAuth, async (req, res, next) => {
    try {
        const authors = await AuthorModel.find()
        res.send(authors)
    } catch (error) {
        next(error)
    }
})

authorsRouter.get('/me', basicAuth, async (req, res, next) => {
    try {
        res.send(req.author)
    } catch (error) {
        next(error)
    }
})

authorsRouter.put('/me', parser.single('authorAvatar'), basicAuth, async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (req.author) {
            const oldAuthor = await AuthorModel.findById(req.author._id)
            if (oldAuthor) {
                const body = { ...req.body, avatar: req.file?.path || oldAuthor.avatar, filename: req.file?.filename || oldAuthor.filename }
                const editedAuthor = await AuthorModel.findByIdAndUpdate(req.author._id, body, { new: true })
                if (!editedAuthor) return next(createHttpError(404, `Author with id ${req.author._id} not found.`))
                if (oldAuthor && req.file) {
                    await cloudinary.uploader.destroy(oldAuthor.filename)
                }
                res.send(editedAuthor)
            } else {
                next(createHttpError(404, `Author with id ${req.author._id} does not exist and cannot be edited.`))
            }
        } else {
            next(createHttpError(400, 'Invalid request.'))
        }
    } catch (error) {
        next(error)
    }
})

authorsRouter.delete('/me', basicAuth, async (req, res, next) => {
    try {
        if (req.author) {
            const deletedAuthor = await AuthorModel.findByIdAndDelete(req.author._id)
            if (!deletedAuthor) return next(createHttpError(404, `Author with id ${req.author._id} does not exist or had already been deleted.`))
            if (deletedAuthor.filename) {
                await cloudinary.uploader.destroy(deletedAuthor.filename)
            }
            res.status(204).send()
        } else {
            next(createHttpError(400, 'Invalid request.'))
        }
    } catch (error) {
        next(error)
    }
})

authorsRouter.get('/me/stories', basicAuth, async (req, res, next) => {
    try {
        if (req.author) {
            const authorPosts = await BlogPostsModel.find({ authors: req.author._id }).populate({ path: "authors", select: "firstName lastName" })
            authorPosts ? res.send(authorPosts) : next(createHttpError(404, `Author with id ${req.author._id} does not exist or had already been deleted.`))
        }
        else {
            next(createHttpError(400, 'Invalid request.'))
        }
    } catch (error) {
        next(error)
    }
})

authorsRouter.get('/:authorId', basicAuth, async (req, res, next) => {
    try {
        const foundAuthor = await AuthorModel.findById(req.params.authorId)
        if (foundAuthor) {
            res.send(foundAuthor)
        } else {
            next(createHttpError(404, `Author with id ${req.params.authorId} does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

authorsRouter.put('/:authorId', parser.single('authorAvatar'), basicAuth, adminAuth, async (req, res, next) => {
    try {
        const oldAuthor = await AuthorModel.findById(req.params.authorId)
        if (oldAuthor) {
            const body = { ...req.body, avatar: req.file?.path || oldAuthor.avatar, filename: req.file?.filename || oldAuthor.filename }
            const editedAuthor = await AuthorModel.findByIdAndUpdate(req.params.authorId, body, { new: true })
            if (!editedAuthor) return next(createHttpError(404, `Author with id ${req.params.authorId} not found.`))
            if (oldAuthor && req.file) {
                await cloudinary.uploader.destroy(oldAuthor.filename)
            }
            res.send(editedAuthor)
        } else {
            next(createHttpError(404, `Author with id ${req.params.authorId} does not exist and cannot be edited.`))
        }
    } catch (error) {
        next(error)
    }
})

authorsRouter.delete('/:authorId', basicAuth, adminAuth, async (req, res, next) => {
    try {
        const deletedAuthor = await AuthorModel.findByIdAndDelete(req.params.authorId)
        if (!deletedAuthor) return next(createHttpError(404, `Author with id ${req.params.authorId} does not exist or had already been deleted.`))
        if (deletedAuthor.filename) {
            await cloudinary.uploader.destroy(deletedAuthor.filename)
        }
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})

export default authorsRouter