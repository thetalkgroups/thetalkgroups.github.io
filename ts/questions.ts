const getQuestionFromCache = (id: string): Question => 
    JSON.parse(localStorage.getItem(`${window.GROUP}-question-${id}`));
const setQuestionInCache = (question: Question) =>
    localStorage.setItem(`${window.GROUP}-question-${question._id}`, JSON.stringify(question));
const getReplyFromCache = (id: string) =>
    JSON.parse(localStorage.getItem(`${window.GROUP}-question-reply-${id}`));
const setReplyInCache = (reply: Reply) =>
    localStorage.setItem(`${window.GROUP}-question-reply-${reply._id}`, JSON.stringify(reply));

const fetchQuestion = (id: string): Promise<Question> => 
    fetch(`http://localhost:4001/group${window.GROUP}questions/${id}`)
        .then(res => res.json());
const listQuestions = (page: number): Promise<string[]> =>
    fetch(`http://localhost:4001/group${window.GROUP}questions/list/${page}`)
        .then(res => res.json());
const fetchQuestions = (ids: string[]): Promise<Question[]> =>
    fetch(`http://localhost:4001/group${window.GROUP}questions`, {
        method: "POST",
        body: JSON.stringify(ids),
        headers: { "Content-Type": "application/json" }
    }).then(res => res.json());

const fetchReplys = (questionId: string, ids: string[]): Promise<Reply[]> => 
    fetch(`http://localhost:4001/group${window.GROUP}questions/${questionId}/replys`, {
        method: "POST",
        body: JSON.stringify(ids),
        headers: { "Content-Type": "application/json" }
    })
        .then(res => res.json());
const listReplys = (questionId: string, page: number): Promise<string[]> => 
    fetch(`http://localhost:4001/group${window.GROUP}questions/${questionId}/replys/list/${page}`)
        .then(res => res.json());

const getQuestion = (id: string): Promise<Question> =>
    Promise.resolve(getQuestionFromCache(id))
        .then(question => {
            if (!question || !question.question) 
                return fetchQuestion(id).then(question => {
                    setQuestionInCache(question);

                    return question;
                });

            return question;
        })
const getQuestions = (page: number): Promise<Question[]> => {
    return listQuestions(page)
        .then(ids => ids.map(id => getQuestionFromCache(id) || id))
        .then(questions => {
            const newQuestionIds = questions
                .map((id, i) => {
                    if (typeof id === "string") {
                        delete questions[i];

                        return id
                    }
                })
                .filter(Boolean) as string[];

            if (newQuestionIds.length === 0) return questions;

            return fetchQuestions(newQuestionIds)
                .then(newQuestions => {
                    newQuestions.forEach(setQuestionInCache);

                    return questions.concat(newQuestions);
                })
        });
};
const addQuestion = (data: { title: string, question: string, user: User }): Promise<void> => {
    delete data;

    return Promise.reject(new Error("not implemented"));
};
const deleteQuestion = (id: string): Promise<void> => {
    delete id;

    return Promise.reject(new Error("not implemented"));
};

const getReplys = (questionId: string, page: number): Promise<Reply[]> =>
    listReplys(questionId, page)
        .then(ids => ids.map(id => getReplyFromCache(id) || id))
        .then(replys => {
            const newReplyIds = replys
                .map((id, i) => {
                    if (typeof id === "string") {
                        delete replys[i];

                        return id
                    }
                })
                .filter(Boolean) as string[];

            if (newReplyIds.length === 0) return replys;

            return fetchReplys(questionId, newReplyIds)
                .then(newReplys => {
                    newReplys.forEach(setReplyInCache)

                    return replys.concat(newReplys);
                })
        })

const addReply = (questionId: string, data: { answer: string, user: User }): Promise<void> => {
    delete questionId;
    delete data;

    return Promise.reject(new Error("not implemented"));
}

const deleteReply = (replyId: string): Promise<void> => {
    delete replyId;

    return Promise.reject(new Error("not implemented"));
}