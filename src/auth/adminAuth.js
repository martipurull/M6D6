import createHttpError from 'http-errors'

export const adminAuth = (req, res, next) => {
    req.author.role === 'Admin' ? next() : next(createHttpError(403, 'You must be an admin to perform this action.'))
}