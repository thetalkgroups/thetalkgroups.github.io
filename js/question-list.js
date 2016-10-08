var createListItem = function (item, className) {
    var itemEl = document.createElement("article");
    itemEl.classList.add(className);
    itemEl.innerHTML = "\n        <header>\n            <p class=\"" + className + "__user-name\">" + item.user.name + "</p>\n            <p class=\"" + className + "__date\">" + moment(item.date).fromNow() + "</p>\n        </header>\n        <a href=\"" + className + ".html?id=" + item._id + "\">" + item.title + "</a>\n    ";
    return itemEl;
};
window.addEventListener("load", function () {
    var questionListEl = document.querySelector(".question-list");
    var askAQuestion = document.querySelector(".questions-header__ask-a-question");
    window.userService.user.subscribe(function (user) {
        if (!user)
            return;
        askAQuestion.hidden = false;
    });
    getQuestions(1).then(function (questions) {
        return questions.map(function (question) { return createListItem(question, "question"); })
            .forEach(function (item) { return questionListEl.appendChild(item); });
    });
});
//# sourceMappingURL=question-list.js.map