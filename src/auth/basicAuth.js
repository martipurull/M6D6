import createHttpError from 'http-errors'
import atob from 'atob'
import AuthorModel from '../services/authors/schema.js'

export const basicAuth = async (req, res, next) => {
    if (!req.headers.authorization) {
        next(createHttpError(401, 'You must provide your login credentials!'))
    } else {
        const base64Credentials = req.headers.authorization.split(' ')[1]
        const decodedCredentials = atob(base64Credentials)
        const [email, password] = decodedCredentials.split(':')
        const author = await AuthorModel.checkCredentials(email, password)
        if (author) {
            req.author = author
            next()
        } else {
            next(createHttpError(401, "Email or password aren't correct."))
        }
    }
}