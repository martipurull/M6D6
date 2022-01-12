import mongoose from "mongoose"

const { Schema, model } = mongoose

const blogCommentSchema = new Schema({
    user: { type: String, required: true },
    text: { type: String, required: true }
},
    { timestamps: true }
)

export default model("BlogComment", blogCommentSchema)