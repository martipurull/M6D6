import mongoose from "mongoose"

const { Schema, model } = mongoose

const AuthorSchema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true },
        dob: { type: String },
        avatar: { type: String }
    },
    { timestamps: true }
)

export default model("Author", AuthorSchema)