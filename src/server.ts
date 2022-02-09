import express from 'express'
import listEndpoints from 'express-list-endpoints'
import cors from 'cors'
import mongoose from 'mongoose'
import authorsRouter from './services/authors/index.js'
import blogPostsRouter from './services/blogPosts/index.js'
import { errorHandler } from './errorHandlers.js'
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
server.use('/blogPosts', blogPostsRouter)

//error handlers
server.use(errorHandler)

mongoose.connect(<string>process.env.MONGO_CONNECTION)

mongoose.connection.on("connected", () => {
    console.log("Connected to Mongo!")
})

server.listen(port, () => {
    console.table(listEndpoints(server))
    console.log(`Server running on port: ${port}`)
})

mongoose.connection.on("error", (err: any) => {
    console.log(err)
})