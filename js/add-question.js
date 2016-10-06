window.addEventListener("load", function () {
    var titleInput = document.querySelector(".add-question input[name=title]");
    var questionTextarea = document.querySelector(".add-question textarea[name=question]");
    var loginWarning = document.querySelector(".add-question__login-warning");
    var form = document.querySelector(".add-question");
    window.userService.user.subscribe(function (user) {
        if (!user)
            return;
        form.hidden = false;
        loginWarning.hidden = true;
        var onAddQuestion = function () {
            addQuestion({ title: titleInput.value, question: questionTextarea.value, user: user })
                .then(function () { return location.href = window.GROUP + "forum/questions"; });
        };
        form.addEventListener("submit", onAddQuestion);
    });
});
//# sourceMappingURL=add-question.js.map