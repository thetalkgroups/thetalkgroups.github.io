const createListItem = (item: { user: User, date: number, _id: string, title: string }, className: string) => {
    const itemEl = document.createElement("article")

    itemEl.classList.add(className);

    itemEl.innerHTML = `
        <header>
            <p class="${className}__user-name">${item.user.name}</p>
            <p class="${className}__date">${moment(item.date).fromNow()}</p>
        </header>
        <a href="${className}.html?id=${item._id}">${item.title}</a>
    `

    return itemEl;
}

window.addEventListener("load", () => {
    const questionListEl = document.querySelector(".question-list") as HTMLElement;
    const askAQuestion = document.querySelector(".questions-header__ask-a-question") as HTMLElement

    window.userService.user.subscribe(user => {
        if (!user) return;

        askAQuestion.hidden = false;
    })

    // TODO pagination
    getQuestions(1).then(questions => 
        questions.map(question => createListItem(question, "question"))
            .forEach(item => questionListEl.appendChild(item)));
});