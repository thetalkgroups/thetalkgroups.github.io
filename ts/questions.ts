const getQuestion = (id: string): Promise<Question> => {
    let question = JSON.parse(localStorage.getItem(`${window.GROUP}-question-${id}`));

    // TODO fetch new answers

    if (!question) {
        // TODO fetch question from server
    }

    return Promise.resolve(question);
}
const getQuestions = (): Promise<Question[]> => {
    const questions = Object.keys(localStorage)
        .filter(key => key.startsWith(`${window.GROUP}-question-`))
        .map(key => localStorage.getItem(key))
        .map(item => JSON.parse(item));

        console.log(Object.keys(localStorage)
        .filter(key => key));

    // TODO fetch new questions

    return Promise.resolve(questions);
};
const addQuestion = (question: { title: string, question: string, user: User }): Promise<void> => {
    // TODO add question

    delete question;

    return Promise.resolve()
}