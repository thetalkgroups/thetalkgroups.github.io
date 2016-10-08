var createUserListItem = function (item, className) {
    var itemEl = document.createElement("article");
    itemEl.classList.add(className);
    itemEl.innerHTML = "\n        <img class=\"" + className + "__photo\" src=\"" + item.user.photo + "\"/>\n        <section class=\"" + className + "__text\">\n            <section>\n                <p class=\"" + className + "__name\">" + item.user.name + "</p>\n                <p class=\"" + className + "__date\">" + moment(item.date).fromNow() + "</p>\n            </section>\n            <p class=\"" + className + "__content\">" + item.title + "</p>\n        </section>\n    ";
    return itemEl;
};
var missingError = function () {
    console.error("question missing");
};
window.addEventListener("load", function () {
    var headerPhoto = document.querySelector(".question__header__photo");
    var headerName = document.querySelector(".question__header__name");
    var headerDate = document.querySelector(".question__header__date");
    var headerTitle = document.querySelector(".question__header__title");
    var headerQuestion = document.querySelector(".question__header__question");
    var answers = document.querySelector(".question__answers");
    var breadcrumbLocation = document.querySelector(".breadcrumb p");
    var reply = document.querySelector(".question__reply");
    var loginWarning = document.querySelector(".question__login-warning");
    window.userService.user.subscribe(function (user) {
        if (!user)
            return;
        loginWarning.hidden = true;
        reply.hidden = false;
    });
    var idMatch = location.search.match(/id=(\w+)/);
    if (!idMatch)
        return missingError();
    getQuestion(idMatch[1])
        .then(function (question) {
        headerPhoto.src = question.user.photo;
        headerName.innerText = question.user.name;
        headerDate.innerText = moment(question.date).fromNow();
        headerTitle.innerText = question.title;
        headerQuestion.innerText = question.question;
        breadcrumbLocation.innerText = question.title;
        return getReplys(question._id, 1).then(function (replys) { return replys
            .map(function (_a) {
            var user = _a.user, date = _a.date, answer = _a.answer;
            return createUserListItem({ user: user, date: date, title: answer }, "question__answers__answer");
        })
            .forEach(function (answer) { return answers.appendChild(answer); }); });
    })
        .catch(function (error) {
        console.error(error);
        missingError();
    });
});
//# sourceMappingURL=question.js.map