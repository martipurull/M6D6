import mongoose from "mongoose"
import bcrypt from 'bcrypt'

const { Schema, model } = mongoose

const AuthorSchema = new Schema(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        dob: { type: String },
        avatar: { type: String },
        email: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['User', 'Admin'], default: 'User' }
    },
    { timestamps: true }
)

//this function fires every time an author password is modified, just as it is saved
AuthorSchema.pre("save", async function (next) {
    const newAuthor = this
    const plainPW = this.password
    if (newAuthor.isModified("password")) {
        const hashedPW = await bcrypt.hash(plainPW, 12)
        newAuthor.password = hashedPW
    }
    next()
})

//this function fires every time express sends users (res.send(users || user) because it's json)
AuthorSchema.methods.toJSON = function () {
    const userDocument = this
    const userObj = userDocument.toObject()
    delete userObj.password
    delete userObj.__v
    return userObj
}

//this is a custom method we will use in the basicAuth middleware
AuthorSchema.statics.checkCredentials = async function (email, plainPW) {
    const author = await this.findOne({ email })
    if (author) {
        const pwMatch = await bcrypt.compare(plainPW, author.password)
        if (pwMatch) {
            return author
        } else {
            return null
        }
    } else {
        return null
    }
}

export default model("Author", AuthorSchema)