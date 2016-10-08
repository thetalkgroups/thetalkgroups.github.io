interface Question {
    _id: string
    user: User
    date: number
    title: string
    question: string
}

interface Reply {
    _id: string
    user: User
    date: number
    answer: string
}