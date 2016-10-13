declare const id: string
declare const api: Api

const createReplyElement = (item: Reply) => {
    const template = document.importNode((document.getElementById("reply") as HTMLTemplateElement).content, true);
    const el = document.createElement("article");
    el.appendChild(template);

    const photo = el.querySelector(".reply__photo") as HTMLImageElement;
    const name = el.querySelector(".reply__name") as HTMLElement;
    const date = el.querySelector(".reply__date") as HTMLElement;
    const answer = el.querySelector(".reply__answer") as HTMLElement;
    const image = el.querySelector(".reply__image") as HTMLImageElement;

    el.className = "reply";

    photo.src = item.user.photo;
    name.innerText = item.user.name;
    date.innerText = moment(item.date).fromNow();
    answer.innerText = item.answer;

    if (item.image) {
        image.hidden = false;
        image.src = api.getImageUrl(item.image)
    }

    return el;
};

window.addEventListener("load", () => {
    const replysEl = document.querySelector(".replys");
    const itemPhoto = document.querySelector(".item__photo") as HTMLImageElement;
    const itemName = document.querySelector(".item__name");
    const itemDate = document.querySelector(".item__date");
    const itemTitle = document.querySelector(".item__title");
    const itemContent = document.querySelector(".item__content");
    const loginWarning = document.querySelector(".login-warning");
    const reply = document.querySelector(".reply-form") as HTMLFormElement;

    let page = 1;
    const pageMatch = location.search.match(/page=(\d+)/);

    if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;
    
    api.list.getOne(id)
        .then(item => {
            itemPhoto.src = item.user.photo;
            itemName.innerHTML = item.user.name;
            itemDate.innerHTML = moment(item.date).fromNow();
            itemTitle.innerHTML = item.title;

            Object.keys(item.content)
                .forEach(k => itemContent.innerHTML += `<div class="${k}">${item.content[k]}</div>`);
        })
        .catch(error => console.error(error));

    api.replys.get(page)
        .then(replys => 
            replys.map(createReplyElement)
                .forEach(replyEl => replysEl.appendChild(replyEl)))
        .catch(error => console.error(error));

    window.userService.user.subscribe(user => {
        if (!user) {
            loginWarning.removeAttribute("hidden");
            reply.setAttribute("hidden", "");

            return;
        }

        delete user.id;

        loginWarning.setAttribute("hidden", "");
        reply.removeAttribute("hidden");

        const onProgress = (progress: number) => {
            console.log(progress);
        }

        reply.onsubmit = event => {
            event.preventDefault();

            const data = formToJson(reply);

            data["user"] = user

            api.add(data, onProgress)
                .then(() => location.href = location.href)
                .catch(error => console.error(error));

            return false;
        };
    })
});