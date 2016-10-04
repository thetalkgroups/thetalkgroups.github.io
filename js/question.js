window.addEventListener("load", function () {
    var createAnswer = function (answer) {
        var item = document.createElement("article");
        item.classList.add("question__answers__answer");
        item.innerHTML = "\n            <img class=\"question__answers__answer__photo\" src=\"" + answer.user.photo + "\"/>\n            <section class=\"question__answers__answer__text\">\n                <section>\n                    <p class=\"question__answers__answer__name\">" + answer.user.name + "</p>\n                    <p class=\"question__answers__answer__date\">" + moment(answer.date).fromNow() + "</p>\n                </section>\n                <p class=\"question__answers__answer__answer\">" + answer.answer + "</p>\n            </section>\n        ";
        return item;
    };
    var missingError = function () {
        console.error("question missing");
    };
    var idMatch = location.search.match(/id=(\w+)/);
    if (!idMatch)
        return missingError();
    var question = getQuestion(idMatch[1]);
    if (!question)
        return missingError();
    var headerPhoto = document.querySelector(".question__header__photo");
    var headerName = document.querySelector(".question__header__name");
    var headerDate = document.querySelector(".question__header__date");
    var headerTitle = document.querySelector(".question__header__title");
    var headerQuestion = document.querySelector(".question__header__question");
    var answers = document.querySelector(".question__answers");
    var breadcrumbLocation = document.querySelector(".breadcrumb p");
    headerPhoto.src = question.user.photo;
    headerName.innerText = question.user.name;
    headerDate.innerText = moment(question.date).fromNow();
    headerTitle.innerText = question.title;
    headerQuestion.innerText = question.question;
    breadcrumbLocation.innerText = question.title;
    question.answers.map(createAnswer).forEach(function (answer) { return answers.appendChild(answer); });
});
//# sourceMappingURL=question.js.map