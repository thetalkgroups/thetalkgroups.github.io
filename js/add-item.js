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
        var onAddItem = function (event) {
            event.preventDefault();
            var formData = formToJson(form);
            var otherFormData = Object.keys(formData).filter(function (k) { return k === "title"; })
                .reduce(function (obj, k) {
                obj[k] = escapeHtml(formData[k]);
                return obj;
            }, {});
            var data = {
                _id: undefined,
                isYou: undefined,
                title: escapeHtml(formData["title"]),
                user: { id: user.id, name: user.name, photo: user.photo },
                content: otherFormData,
                fields: fields.map(function (field) { return field.name; })
            };
            api.items.add(data)
                .then(function () { return location.href = location.href.replace(/[\w-]+\.html$/, ""); })
                .catch(function (error) { return console.error(error); });
            return false;
        };
        form.addEventListener("submit", onAddItem);
    });
});
//# sourceMappingURL=add-item.js.map