import express from 'express'
import AuthorModel from './schema.js'
import createHttpError from 'http-errors'
import { basicAuth } from '../../auth/basicAuth.js'

const authorsRouter = express.Router()

authorsRouter.post('/', async (req, res, next) => {
    try {
        const newAuthor = new AuthorModel(req.body)
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

authorsRouter.put('/me', basicAuth, async (req, res, next) => {
    try {
        const editedAuthor = await AuthorModel.findByIdAndUpdate(req.author._id, req.body, { new: true })
        editedAuthor ? res.send(editedAuthor) : next(createHttpError(404, `Author with id ${ req.author._id } not found.`))
    } catch (error) {
        next(error)
    }
})

authorsRouter.delete('/me', basicAuth, async (req, res, next) => {
    try {
        const deletedAuthor = await AuthorModel.findByIdAndDelete(req.author._id)
        deletedAuthor ? res.status(204).send() : next(createHttpError(404, `Author with id ${ req.author._id } did not exist or had already been deleted.`))
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
            next(createHttpError(404, `Author with id ${ req.params.authorId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

authorsRouter.put('/:authorId', basicAuth, async (req, res, next) => {
    try {
        const editedAuthor = await AuthorModel.findByIdAndUpdate(req.params.authorId, req.body, { new: true })
        if (editedAuthor) {
            res.send(editedAuthor)
        } else {
            next(createHttpError(404, `Author with id ${ req.params.authorId } does not exist or has been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

authorsRouter.delete('/:authorId', basicAuth, async (req, res, next) => {
    try {
        const deletedAuthor = await AuthorModel.findByIdAndDelete(req.params.authorId)
        if (deletedAuthor) {
            res.status(204).send()
        } else {
            next(createHttpError(404, `Author with id ${ req.params.authorId } did not exist or had already been deleted.`))
        }
    } catch (error) {
        next(error)
    }
})

export default authorsRouter