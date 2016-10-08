window.addEventListener("load", function () {
    new Api("/group" + window.GROUP_URL + "/questions").initList()
        .catch(console.error);
});
//# sourceMappingURL=question-list.js.map