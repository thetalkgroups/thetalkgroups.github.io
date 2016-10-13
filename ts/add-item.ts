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

        const onAddItem = (event: Event) => {
            event.preventDefault();

            const formData = formToJson(form) as { [key: string]: any }
            const otherFormData = Object.keys(formData).filter(k => k === "title")
                .reduce((obj, k) => {
                    obj[k] = escapeHtml(formData[k])
                    return obj;
                }, {} as { [key: string]: any})

            const data: Item = {
                _id: undefined,
                isYou: undefined,
                title: escapeHtml(formData["title"] as string), 
                user: { id: user.id, name: user.name, photo: user.photo },
                content: otherFormData, 
                fields: fields.map(field => field.name) 
            };

            api.items.add(data)
                .then(() => location.href = location.href.replace(/[\w-]+\.html$/, ""))
                .catch(error => console.error(error));

            return false;
        };

        form.addEventListener("submit", onAddItem);
    });
});