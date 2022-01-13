import mongoose from "mongoose"

const { Schema, model } = mongoose

const BlogPostSchema = new Schema(
    {
        category: { type: String, required: true, enum: ["Life", "Life Hacks", "Technology", "Opinion", "Inspiration"] },
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
        author: { type: Schema.Types.ObjectId, ref: "Author" },
        content: { type: String, required: true },
        comments: [
            {
                user: { type: String },
                text: { type: String },
                createdAt: { type: Date },
                updatedAt: { type: Date }
            }
        ],
        likes: [{ type: Schema.Types.ObjectId, ref: "Author" }],
        totalLikes: {
            type: Number,
            default: function () {
                return this.likes.length
            }
        }
    },
    { timestamps: true }
)

export default model("BlogPosts", BlogPostSchema)