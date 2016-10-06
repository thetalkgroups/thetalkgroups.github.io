const createQuestionListItem = (question: Question) => {
    const item = document.createElement("article")

    item.classList.add("question")

    item.innerHTML = `
        <header>
            <p class="question__user-name">${question.user.name}</p>
            <p class="question__date">${moment(question.date).fromNow()}</p>
        </header>
        <a href="question.html?id=${question.id}">${question.title}</a>
    `

    return item;
}

window.addEventListener("load", () => {
    const questionListEl = document.querySelector(".question-list") as HTMLElement;
    const askAQuestion = document.querySelector(".questions-header__ask-a-question") as HTMLElement

    window.userService.user.subscribe(user => {
        if (!user) return;

        askAQuestion.hidden = false;
    })

    getQuestions().then(questions => 
        questions.map(createQuestionListItem)
            .forEach(item => questionListEl.appendChild(item)));
});