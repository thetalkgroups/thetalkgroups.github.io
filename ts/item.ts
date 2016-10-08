declare const id: string
declare const api: Api

const createReplyElement = (item: Reply) => {
    const el = document.createElement("article");
    const photo = document.createElement("img");
    const text = document.createElement("section");
    const textHeader = document.createElement("section");
    const name = document.createElement("p");
    const date = document.createElement("p");
    const answer = document.createElement("p");

    photo.className = "reply__photo";
    photo.src = item.user.photo;

    name.className = "reply__name";
    name.innerText = item.user.name;

    date.className = "reply__date";
    date.innerText = moment(item.date).fromNow();

    textHeader.appendChild(name);
    textHeader.appendChild(date);

    answer.className = "reply__answer";
    answer.innerText = item.answer;

    text.className = "reply__text";
    text.appendChild(textHeader);
    text.appendChild(answer);
    
    el.className = "reply";
    el.appendChild(photo);
    el.appendChild(text);

    return el;
};

window.addEventListener("load", () => {
    let page = 1;
    const pageMatch = location.search.match(/page=(\d+)/);

    if (pageMatch) page = parseInt(pageMatch[1], 10) || 1;
    
    const itemEl = document.querySelector(".item") as HTMLElement;
    const replysEl = document.createElement("section") as HTMLElement;

    return api.list.getOne(id).then(item =>
        api.replys.get(page).then(replys => {
            replysEl.className = "replys";
            replys.map(createReplyElement).forEach(replyEl => replysEl.appendChild(replyEl));

            itemEl.innerHTML = `
                <section class="item__header">
                    <header class="item__header__top">
                        <img class="item__photo" src="${item.user.photo}" alt="photo">
                        <section>
                            <p class="item__name">${item.user.name}</p>
                            <p class="item__date">${moment(item.date).fromNow()}</p>
                        </section>
                    </header>
                    <h2 class="item__title">${item.title}</h2>
                    <p class="item__content">${item.content}</p>
                </section>                
            `

            itemEl.appendChild(replysEl);

            itemEl.innerHTML += `
                <section class="login-warning">
                    <p><a href="/sign-in.html">login</a> to reply</p>
                </section>

                <form class="reply-form" hidden>
                    <label for="image"><img src="/assets/static/ic_camera_alt_black_24px.svg" alt="upload photo"></label>
                    <input id="image" name="image" type="file" accept="image/*" hidden>
                    <textarea id="answer" name="answer" placeholder="type your answer here..." required></textarea>
                    <button type="submit">reply</button>
                </form>
            `;
        }))
        .then(_ => {
            const loginWarning = itemEl.querySelector(".login-warning") as HTMLElement;
            const reply = itemEl.querySelector(".reply-form") as HTMLFormElement;

            window.userService.user.subscribe(user => {
                if (!user) {
                    loginWarning.hidden = false;
                    reply.hidden = true;

                    return;
                }

                delete user.id;

                loginWarning.hidden = true;
                reply.hidden = false;

                reply.onsubmit = event => {
                    event.preventDefault();

                    const data = formToJson<Reply>(reply);

                    data.user = user

                    api.add(data, true)
                        .then(() => location.href = location.href)
                        .catch(error => console.error(error));

                    return false;
                };
            })
        })
        .catch(error => console.error(error));
});