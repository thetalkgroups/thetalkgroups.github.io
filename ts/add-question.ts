window.addEventListener("load", () => {
    const loginWarning = document.querySelector(".add-question__login-warning") as HTMLElement;
    const form = document.querySelector(".add-question") as HTMLFormElement;

    window.userService.user.subscribe(user => {
        if (!user) return;

        form.hidden = false;
        loginWarning.hidden = true;

        const onAddQuestion = (event: Event) => {
            event.preventDefault();

            const data = formToJson<Item>(form)

            delete user.id;

            data.user = user;

            api.add(data)
                .then(() => location.href = window.GROUP_URL + "/forum/questions")
                .catch(error => console.error(error));

            return false;
        };

        form.addEventListener("submit", onAddQuestion);
    });
});