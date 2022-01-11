import express from 'express'
import { v4 as uuidv4 } from 'uuid'
import { getAuthors, createAuthors } from '../library/fs-tools.js'
import createHttpError from 'http-errors'

const authorsRouter = express.Router()

//middleware
const checkEmail = async (req, res, next) => {
    const authors = await getAuthors()
    const isEmailTaken = authors.find(author => author.email === req.body.email)
    if (isEmailTaken) {
        next(createHttpError(409, `${ req.body.email } is already in use. Please choose another email address.`))
    } else {
        next()
    }
}

//endpoints
authorsRouter.post('/', checkEmail, async (req, res, next) => {
    try {
        const authors = await getAuthors()
        const newAuthor = { ...req.body, createdAt: new Date(), id: uuidv4() }
        authors.push(newAuthor)
        await createAuthors(authors)
        res.status(201).send({ id: newAuthor.id })
    } catch (error) {
        next(error)
    }
})

authorsRouter.get('/', async (req, res, next) => {
    try {
        const authors = await getAuthors()
        res.send(authors)
    } catch (error) {
        next(error)
    }
})

authorsRouter.get('/:authorId', async (req, res, next) => {
    try {
        const authors = await getAuthors()
        const authorFound = authors.find(a => a.id === req.params.authorId)
        if (authorFound) {
            res.send(authorFound)
        } else {
            next(createHttpError(404, `${ authorFound.name } ${ authorFound.surname } with id ${ authorFound.id } does not exist in the database.`))
        }
    } catch (error) {
        next(error)
    }
})

authorsRouter.put('/:authorId', async (req, res, next) => {
    try {
        const authors = await getAuthors()
        const authorIndex = authors.findIndex(a => a.id === req.params.authorId)
        const editedAuthor = { ...authors[authorIndex], ...req.body, updatedAt: new Date() }
        authors[authorIndex] = editedAuthor
        await createAuthors(authors)
        res.send(editedAuthor)
    } catch (error) {
        next(error)
    }
})

authorsRouter.delete('/:authorId', async (req, res, next) => {
    try {
        const authors = await getAuthors()
        const authorsLeft = authors.filter(a => a.id !== req.params.authorId)
        await createAuthors(authorsLeft)
        res.status(204).send()
    } catch (error) {
        next(error)
    }
})






export default authorsRouter