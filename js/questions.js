var getQuestion = function (id) {
    var question = JSON.parse(localStorage.getItem(window.GROUP + "-question-" + id));
    if (!question) {
    }
    return Promise.resolve(question);
};
var getQuestions = function () {
    var questions = Object.keys(localStorage)
        .filter(function (key) { return key.startsWith(window.GROUP + "-question-"); })
        .map(function (key) { return localStorage.getItem(key); })
        .map(function (item) { return JSON.parse(item); });
    console.log(Object.keys(localStorage)
        .filter(function (key) { return key; }));
    return Promise.resolve(questions);
};
var addQuestion = function (question) {
    delete question;
    return Promise.resolve();
};
//# sourceMappingURL=questions.js.map