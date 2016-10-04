window.addEventListener("load", () => {
    const createAnswer = (answer: Answer) => {
        const item = document.createElement("article");

        item.classList.add("question__answers__answer");

        item.innerHTML = `
            <img class="question__answers__answer__photo" src="${answer.user.photo}"/>
            <section class="question__answers__answer__text">
                <section>
                    <p class="question__answers__answer__name">${answer.user.name}</p>
                    <p class="question__answers__answer__date">${moment(answer.date).fromNow()}</p>
                </section>
                <p class="question__answers__answer__answer">${answer.answer}</p>
            </section>
        `;

        return item;
    }
    const missingError = () => {
        console.error("question missing");
    }

    const idMatch = location.search.match(/id=(\w+)/);
    if (!idMatch) return missingError();
    const question = getQuestion(idMatch[1]);
    if (!question) return missingError();

    const headerPhoto = document.querySelector(".question__header__photo") as HTMLImageElement;
    const headerName = document.querySelector(".question__header__name") as HTMLElement;
    const headerDate = document.querySelector(".question__header__date") as HTMLElement;
    const headerTitle = document.querySelector(".question__header__title") as HTMLElement;
    const headerQuestion = document.querySelector(".question__header__question") as HTMLElement;
    const answers = document.querySelector(".question__answers");
    const breadcrumbLocation = document.querySelector(".breadcrumb p") as HTMLElement;

    headerPhoto.src = question.user.photo;
    headerName.innerText = question.user.name;
    headerDate.innerText = moment(question.date).fromNow();
    headerTitle.innerText = question.title;
    headerQuestion.innerText = question.question;
    breadcrumbLocation.innerText = question.title;

    question.answers.map(createAnswer).forEach(answer => answers.appendChild(answer));
});