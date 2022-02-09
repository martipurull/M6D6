import fs from 'fs-extra'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { readJSON, writeJSON, writeFile } = fs


const dataFolderPath = join(dirname(fileURLToPath(import.meta.url)), "../data")
const blogCoversPublicFolderPath = join(process.cwd(), "./public/blog-covers")
const authorAvatarsPublicFolderPath = join(process.cwd(), "./public/author-avatars")

const blogPostsJSONPath = join(dataFolderPath, "blogPosts.json")
const authorsJSONPath = join(dataFolderPath, "authors.json")

export const getBlogPosts = () => readJSON(blogPostsJSONPath)
export const getAuthors = () => readJSON(authorsJSONPath)
export const postBlogPost = (content: any) => writeJSON(blogPostsJSONPath, content)
export const createAuthors = (content: any) => writeJSON(authorsJSONPath, content)
export const saveBlogCover = (fileName: string, fileContentAsBuffer: any) => writeFile(join(blogCoversPublicFolderPath, fileName), fileContentAsBuffer)
export const saveAuthorAvatar = (fileName: string, fileContentAsBuffer: any) => writeFile(join(authorAvatarsPublicFolderPath, fileName), fileContentAsBuffer)