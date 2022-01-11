export const badRequestHandler = (err, req, res, next) => {
    if (err.status === 400) {
        res.status(400).send({ message: err.message, errorList: err.errorList })
    } else {
        next(err)
    }
}

export const unauthorisedHandler = (err, req, res, next) => {
    if (err.status === 401) {
        res.status(401).send({ message: err.message })
    } else {
        next(err)
    }
}

export const notFoundHandler = (err, req, res, next) => {
    if (err.status === 404) {
        res.status(404).send({ message: err.message })
    } else {
        next(err)
    }
}

export const dateConflictHandler = (err, req, res, next) => {
    if (err.status === 409) {
        res.status(409).send({ message: err.message })
    } else {
        next(err)
    }
}

export const genericErrorHandler = (err, req, res, next) => {
    console.log("A generic error occurred and we ain't revealing it. Developer's eyes only: ", err)
    res.status(500).send({ message: "Something went wrong and we're working hard on a solution!" })
}