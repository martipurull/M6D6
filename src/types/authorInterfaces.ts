import { Document, Model, ObjectId } from "mongoose";

export interface IAuthor {
    firstName: string,
    lastName: string,
    dob: string,
    avatar: string,
    filename: string,
    email: string,
    password: string,
    role: string,
    _id: ObjectId
}

export type IAuthorDocument = IAuthor & Document

export interface IAuthorModel extends Model<IAuthor> {
    authenticate(email: string, plainPW: string): IAuthor | null
}