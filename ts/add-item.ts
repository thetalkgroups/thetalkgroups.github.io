declare const fields: { name: string, type: string, required: boolean }[]

window.addEventListener("load", () => {
    const loginWarning = document.querySelector(".login-warning") as HTMLElement;
    const form = document.querySelector(".add-item") as HTMLFormElement;
    const fieldsEl = form.querySelector(".fields");

    fields.forEach(field => {
        const label = document.createElement("label") as HTMLLabelElement;
        const input = document.createElement(field.type) as HTMLInputElement;

        label.innerText = field.name;
        label.setAttribute("for", field.name);

        input.id = field.name;
        input.name = field.name;
        input.required = field.required;

        fieldsEl.appendChild(label);
        fieldsEl.appendChild(input);
    })

    window.userService.user.subscribe(user => {
        if (!user) return;

        form.hidden = false;
        loginWarning.hidden = true;

        const onAddQuestion = (event: Event) => {
            event.preventDefault();

            const data: Reply = Object.assign(formToJson(form), { user: { name: user.name, photo: user.photo }});

            api.add(data)
                .then(() => location.href = window.GROUP_URL + "/forum/questions")
                .catch(error => console.error(error));

            return false;
        };

        form.addEventListener("submit", onAddQuestion);
    });
});