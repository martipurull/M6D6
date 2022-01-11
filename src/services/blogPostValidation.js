import { body } from 'express-validator'

export const blogPostsValidation = [
    body("author").exists().withMessage("We need the author's name!"),
    body("title").exists().withMessage("You'd better provide a title for your blog post!"),
    body("category").exists().withMessage("You'd better select a category for your blog post!"),
    body("content").exists().withMessage("No empty blog posts shall be allowed to be posted... got content for us?")
]

export const blogCommentValidation = [
    body("user").exists().withMessage("We need your name if you need to comment."),
    body("text").exists().withMessage("We need some text for the comment!")
]