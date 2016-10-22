import "./common";
import { formToJson, HOST } from "./api-globals"
import { userService } from "./globals"
import { Item } from "./types/item"
import { User } from "./types/user"

declare const fields: { name: string, type: string, attributes: string }[]
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

    fields.forEach(({ name, type, attributes }) => {
        const container = document.createElement("article");
        const label = document.createElement("label") as HTMLLabelElement;
        let input: HTMLInputElement

        container.className = "input-container";

        if (type === "image") {
            input = document.createElement("input");

            input.setAttribute("type", "file");
            input.setAttribute("accept", "image/*");
        }
        else {
            input = document.createElement(type) as HTMLInputElement;
        }

        label.innerText = name;
        label.setAttribute("for", name);
        
        input.id = name;
        input.name = name;
        
        if (attributes) {
            attributes.split(" ").map(values => values.split("="))
                .forEach(([ key, value ]) => input.setAttribute(key, (value || "").replace(/'/g, "")));
        }

        if (type === "image") {
            container.classList.add("image");
        }

        container.appendChild(label);
        container.appendChild(input);
        fieldsEl.appendChild(container);
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
            const content = Object.keys(formData).filter(k => k !== "title")
                .reduce((obj, k) => {
                    obj[k] = formData[k];

                    return obj;
                }, {} as { [key: string]: any})

            const imagesUploaded = Promise.all(fields.filter(f => f.type === "image").map(f => f.name).map(name => {
                const image = content[name];

                if (image.size) {
                    const fd = new FormData();
                    const xhr = new XMLHttpRequest();

                    fd.append("image", image);

                    return new Promise<void>((resolve, reject) => {
                        xhr.onload = () => {
                            (content as any)[name] = xhr.responseText;

                            resolve();
                        };
                        xhr.onerror = reject;

                        xhr.open("POST", HOST + "/files", true);
                        xhr.setRequestHeader("Authorization", user.id)
                        xhr.send(fd);
                    })
                }
            }))

            imagesUploaded
                .then(() => {
                    const data: Item = {
                        _id: undefined,
                        permission: undefined,
                        title: formData["title"] as string, 
                        user: { id: user.id, name: user.name, photo: user.photo, email: user.email },
                        content, 
                        fields: fields.map(field => field.name) 
                    };

                    addItem(data, user.id)
                })
                .then(() => location.href = location.href.replace(/[\w-]+\.html$/, ""))
                .catch(error => console.error(error));

            return false;
        };

        form.addEventListener("submit", onAddItem);
    });
});