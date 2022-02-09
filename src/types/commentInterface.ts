import { ObjectId } from "mongoose";

export interface IBlogComment {
    user: string,
    text: string,
    _id: ObjectId
}