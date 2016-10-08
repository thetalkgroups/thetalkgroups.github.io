window.addEventListener("load", function () {
    var loginWarning = document.querySelector(".add-question__login-warning");
    var form = document.querySelector(".add-question");
    window.userService.user.subscribe(function (user) {
        if (!user)
            return;
        form.hidden = false;
        loginWarning.hidden = true;
        var onAddQuestion = function (event) {
            event.preventDefault();
            var data = formToJson(form);
            delete user.id;
            data.user = user;
            api.add(data)
                .then(function () { return location.href = window.GROUP_URL + "/forum/questions"; })
                .catch(function (error) { return console.error(error); });
            return false;
        };
        form.addEventListener("submit", onAddQuestion);
    });
});
//# sourceMappingURL=add-question.js.map