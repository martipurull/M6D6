import express from 'express'
import listEndpoints from 'express-list-endpoints'
import cors from 'cors'
import mongoose from 'mongoose'
import authorsRouter from './services/authors.js'
import blogPostsRouter from './services/blogPosts/index.js'
import blogCommentsRouter from './services/blogComments/index.js'
import blogCoversRouter from './services/blogCovers.js'
import authorAvatarsRouter from './services/authorAvatars.js'
import { badRequestHandler, unauthorisedHandler, notFoundHandler, genericErrorHandler } from './errorHandlers.js'
import { join } from 'path'

const server = express()

const port = process.env.PORT || 3001

const publicFolderPath = join(process.cwd(), "./public")

//middleware
server.use(express.static(publicFolderPath))
server.use(cors())
server.use(express.json())

//endpoints
server.use('/authors', authorsRouter)
server.use('/authors/:authorId/uploadAvatar', authorAvatarsRouter)
server.use('/blogPosts', blogPostsRouter)
server.use('/blogPosts/:postId/comments', blogCommentsRouter)
server.use('/blogPosts/:postId/uploadCover', blogCoversRouter)

//error handlers
server.use(badRequestHandler)
server.use(unauthorisedHandler)
server.use(notFoundHandler)
server.use(genericErrorHandler)

mongoose.connect(process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
    console.log("Connected to Mongo!")
})

server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server running on port: ${ port }`)
})

mongoose.connection.on("error", err => {
    console.log(err)
})