import { User } from "./user"

export interface Item {
    _id: string
    user: User
    date?: number
    title: string
    content: { [key: string]: any }
    fields: string[]
    sticky?: boolean
    permission: string
}

export interface Reply {
    _id: string
    itemId: string
    user: User
    date: number
    answer: string
    image: string
    permission: string
}