import { IAuthor } from "./authorInterfaces";

declare module 'express-serve-static-core' {
    interface Request {
        author?: IAuthor
    }
}