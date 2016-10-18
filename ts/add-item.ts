import "./common";
import { formToJson, HOST } from "./api-globals"
import { userService } from "./globals"
import { Item } from "./types/item"
import { User } from "./types/user"

declare const fields: { name: string, type: string, required: boolean }[]
declare const prefix: string

const addItem = (data: any, userId: string) =>
    fetch(HOST + prefix, {
        method: "PUT",
        headers: { 
            "Content-Type": "application/json", 
            "Authorization": userId 
        },
        body: JSON.stringify(data)
    })
        .then(res => {
            if (!res.ok) {
                res.text().then(text => console.error(text))
                return;
            }

            return res;
        })

window.addEventListener("load", () => {
    const loginWarning = document.querySelector(".login-warning") as HTMLElement;
    const form = document.querySelector(".add-item") as HTMLFormElement;
    const fieldsEl = form.querySelector(".fields");
    const errorEl = document.querySelector(".error");


    const handleError = (error: any) => {
        console.error(error);

        errorEl.removeAttribute("hidden");

        loginWarning.setAttribute("hidden", "");
        form.setAttribute("hidden", "");
    } 

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

    userService.user.subscribe(user => {
        if (!user) {
            form.setAttribute("hidden", "");
            loginWarning.removeAttribute("hidden");

            return;
        }

        form.removeAttribute("hidden");
        loginWarning.setAttribute("hidden", "");

        const onAddItem = (event: Event) => {
            event.preventDefault();

            const formData = formToJson(form) as { [key: string]: any }
            const otherFormData = Object.keys(formData).filter(k => k !== "title")
                .reduce((obj, k) => {
                    obj[k] = formData[k]
                    return obj;
                }, {} as { [key: string]: any})

            const data: Item = {
                _id: undefined,
                permission: undefined,
                title: formData["title"] as string, 
                user: { id: user.id, name: user.name, photo: user.photo },
                content: otherFormData, 
                fields: fields.map(field => field.name) 
            };

            addItem(data, user.id)
                .then(() => location.href = location.href.replace(/[\w-]+\.html$/, ""))
                .catch(error => console.error(error));

            return false;
        };

        

        form.addEventListener("submit", onAddItem);
    });
});