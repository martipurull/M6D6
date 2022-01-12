import mongoose from "mongoose"

const { Schema, model } = mongoose

const blogPostSchema = new Schema(
    {
        category: { type: String, required: true },
        title: { type: String, required: true },
        cover: { type: String },
        readTime: {
            value: {
                type: Number,
                default: function () {
                    return this.content.split(' ').length / 250
                }
            },
            unit: {
                type: String,
                default: "minutes"
            }
        },
        author: {
            name: { type: String, required: true },
            avatar: { type: String }
        },
        content: { type: String, required: true },
        comments: [
            {
                user: { type: String },
                text: { type: String },
                createdAt: { type: Date },
                updatedAt: { type: Date }
            }
        ]
    },
    {
        timestamps: true
    }
)

export default model("BlogPosts", blogPostSchema)