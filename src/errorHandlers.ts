import { ErrorRequestHandler } from "express"

export const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
    console.log('ERROR LOGGED: ', err.name)
    switch (parseInt(err.status)) {
        case 400:
            res.status(400).send({ message: err.message, errorList: err.errorList })
        case 401:
            res.status(401).send({ message: err.message, errorList: err.errorList })
        case 403:
            res.status(403).send({ message: err.message, errorList: err.errorList })
        case 404:
            res.status(404).send({ message: err.message, errorList: err.errorList })
        case 409:
            res.status(409).send({ message: err.message, errorList: err.errorList })
        default:
            console.log("A generic server error occurred. Developer's eyes only: ", err)
            res.status(500).send({ message: "Something went wrong and we're working hard on a solution!" })
    }
}