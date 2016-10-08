const createUserListItem = (item: { user: User, title: string, date: number }, className: string) => {
    const itemEl = document.createElement("article");

    itemEl.classList.add(className);

    itemEl.innerHTML = `
        <img class="${className}__photo" src="${item.user.photo}"/>
        <section class="${className}__text">
            <section>
                <p class="${className}__name">${item.user.name}</p>
                <p class="${className}__date">${moment(item.date).fromNow()}</p>
            </section>
            <p class="${className}__content">${item.title}</p>
        </section>
    `;

    return itemEl;
}
const missingError = () => {
    console.error("question missing");
}

window.addEventListener("load", () => {
    const headerPhoto = document.querySelector(".question__header__photo") as HTMLImageElement;
    const headerName = document.querySelector(".question__header__name") as HTMLElement;
    const headerDate = document.querySelector(".question__header__date") as HTMLElement;
    const headerTitle = document.querySelector(".question__header__title") as HTMLElement;
    const headerQuestion = document.querySelector(".question__header__question") as HTMLElement;
    const answers = document.querySelector(".question__answers");
    const breadcrumbLocation = document.querySelector(".breadcrumb p") as HTMLElement;
    const reply = document.querySelector(".question__reply") as HTMLElement;
    const loginWarning = document.querySelector(".question__login-warning") as HTMLElement;

    window.userService.user.subscribe(user => {
        if (!user) return;

        loginWarning.hidden = true;
        reply.hidden = false;
    })

    const idMatch = location.search.match(/id=(\w+)/);
    if (!idMatch) return missingError();
    
    getQuestion(idMatch[1])
        .then(question => {
            headerPhoto.src = question.user.photo;
            headerName.innerText = question.user.name;
            headerDate.innerText = moment(question.date).fromNow();
            headerTitle.innerText = question.title;
            headerQuestion.innerText = question.question;
            breadcrumbLocation.innerText = question.title;

            // TODO pagination
            return getReplys(question._id, 1).then(replys => replys
                .map(({ user, date, answer }) => 
                    createUserListItem({ user, date, title: answer}, "question__answers__answer"))
                .forEach(answer => answers.appendChild(answer)));
        })
        .catch(error => {
            console.error(error);
            missingError();
        });
});