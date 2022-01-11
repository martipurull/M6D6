import express from 'express'
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
// import pool from '../library/db-tools/connect.js'

const authorAvatarUploader = express.Router({ mergeParams: true })

const { CLOUDINARY_NAME, CLOUDINARY_API_KEY, CLOUDINARY_SECRET } = process.env

cloudinary.config({
    cloud_name: CLOUDINARY_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_SECRET
})

const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'strive-blog-avatar',
    },
});

const parser = multer({ storage: cloudinaryStorage });

authorAvatarUploader.post('/', parser.single('productImage'), async (req, res, next) => {
    try {
        const imageUrl = req.file.path
        const result = await pool.query(
            `INSERT INTO image (image_url) VALUES ($1) RETURNING *;`,
            [imageUrl]
        )
        res.status(201).send(result.rows[0])
    } catch (error) {
        res.status(500).send(`Generic server error: ${ error }`)
    }
})






export default authorAvatarUploader