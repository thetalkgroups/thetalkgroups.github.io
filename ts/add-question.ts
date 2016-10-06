window.addEventListener("load", () => {
    const titleInput = document.querySelector(".add-question input[name=title]") as HTMLInputElement;
    const questionTextarea = document.querySelector(".add-question textarea[name=question]") as HTMLTextAreaElement;
    const loginWarning = document.querySelector(".add-question__login-warning") as HTMLElement;
    const form = document.querySelector(".add-question") as HTMLElement;

    window.userService.user.subscribe(user => {
        if (!user) return;

        form.hidden = false;
        loginWarning.hidden = true;

        const onAddQuestion = () => {
            addQuestion({ title: titleInput.value, question: questionTextarea.value, user })
                .then(() => location.href = `${window.GROUP}forum/questions`);
        };

        form.addEventListener("submit", onAddQuestion);
    });
});