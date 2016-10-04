window.addEventListener("load", function () {
    var createQuestionListItem = function (question) {
        var item = document.createElement("article");
        item.classList.add("question");
        item.innerHTML = "\n            <header>\n                <p class=\"question__user-name\">" + question.user.name + "</p>\n                <p class=\"question__date\">" + moment(question.date).fromNow() + "</p>\n            </header>\n            <a href=\"question.html?id=" + question.id + "\">" + question.title + "</a>\n        ";
        return item;
    };
    var questionListEl = document.querySelector(".question-list");
    getQuestions().map(createQuestionListItem).forEach(function (item) { return questionListEl.appendChild(item); });
});
//# sourceMappingURL=question-list.js.map