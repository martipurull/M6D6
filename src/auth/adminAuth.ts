import { NextFunction, Request, Response } from 'express'
import createHttpError from 'http-errors'

export const adminAuth = (req: Request, res: Response, next: NextFunction) => {
    req.author && req.author.role === 'Admin' ? next() : next(createHttpError(403, 'You must be an admin to perform this action.'))
}