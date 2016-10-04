window.addEventListener("load", () => {
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

    const questionListEl = document.querySelector(".question-list");

    getQuestions().map(createQuestionListItem).forEach(item => questionListEl.appendChild(item))
});