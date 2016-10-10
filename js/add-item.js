window.addEventListener("load", function () {
    var loginWarning = document.querySelector(".login-warning");
    var form = document.querySelector(".add-item");
    var fieldsEl = form.querySelector(".fields");
    fields.forEach(function (field) {
        var label = document.createElement("label");
        var input = document.createElement(field.type);
        label.innerText = field.name;
        label.setAttribute("for", field.name);
        input.id = field.name;
        input.name = field.name;
        input.required = field.required;
        fieldsEl.appendChild(label);
        fieldsEl.appendChild(input);
    });
    window.userService.user.subscribe(function (user) {
        if (!user)
            return;
        form.hidden = false;
        loginWarning.hidden = true;
        var onAddQuestion = function (event) {
            event.preventDefault();
            var data = Object.assign(formToJson(form), { user: { name: user.name, photo: user.photo } });
            api.add(data)
                .then(function () { return location.href = window.GROUP_URL + "/forum/questions"; })
                .catch(function (error) { return console.error(error); });
            return false;
        };
        form.addEventListener("submit", onAddQuestion);
    });
});
//# sourceMappingURL=add-item.js.map