var createQuestionListItem = function (question) {
    var item = document.createElement("article");
    item.classList.add("question");
    item.innerHTML = "\n        <header>\n            <p class=\"question__user-name\">" + question.user.name + "</p>\n            <p class=\"question__date\">" + moment(question.date).fromNow() + "</p>\n        </header>\n        <a href=\"question.html?id=" + question.id + "\">" + question.title + "</a>\n    ";
    return item;
};
window.addEventListener("load", function () {
    var questionListEl = document.querySelector(".question-list");
    var askAQuestion = document.querySelector(".questions-header__ask-a-question");
    window.userService.user.subscribe(function (user) {
        if (!user)
            return;
        askAQuestion.hidden = false;
    });
    getQuestions().then(function (questions) {
        return questions.map(createQuestionListItem)
            .forEach(function (item) { return questionListEl.appendChild(item); });
    });
});
//# sourceMappingURL=question-list.js.map