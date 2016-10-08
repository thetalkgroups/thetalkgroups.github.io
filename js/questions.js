var getQuestionFromCache = function (id) {
    return JSON.parse(localStorage.getItem(window.GROUP + "-question-" + id));
};
var setQuestionInCache = function (question) {
    return localStorage.setItem(window.GROUP + "-question-" + question._id, JSON.stringify(question));
};
var getReplyFromCache = function (id) {
    return JSON.parse(localStorage.getItem(window.GROUP + "-question-reply-" + id));
};
var setReplyInCache = function (reply) {
    return localStorage.setItem(window.GROUP + "-question-reply-" + reply._id, JSON.stringify(reply));
};
var fetchQuestion = function (id) {
    return fetch("http://localhost:4001/group" + window.GROUP + "questions/" + id)
        .then(function (res) { return res.json(); });
};
var listQuestions = function (page) {
    return fetch("http://localhost:4001/group" + window.GROUP + "questions/list/" + page)
        .then(function (res) { return res.json(); });
};
var fetchQuestions = function (ids) {
    return fetch("http://localhost:4001/group" + window.GROUP + "questions", {
        method: "POST",
        body: JSON.stringify(ids),
        headers: { "Content-Type": "application/json" }
    }).then(function (res) { return res.json(); });
};
var fetchReplys = function (questionId, ids) {
    return fetch("http://localhost:4001/group" + window.GROUP + "questions/" + questionId + "/replys", {
        method: "POST",
        body: JSON.stringify(ids),
        headers: { "Content-Type": "application/json" }
    })
        .then(function (res) { return res.json(); });
};
var listReplys = function (questionId, page) {
    return fetch("http://localhost:4001/group" + window.GROUP + "questions/" + questionId + "/replys/list/" + page)
        .then(function (res) { return res.json(); });
};
var getQuestion = function (id) {
    return Promise.resolve(getQuestionFromCache(id))
        .then(function (question) {
        if (!question || !question.question)
            return fetchQuestion(id).then(function (question) {
                setQuestionInCache(question);
                return question;
            });
        return question;
    });
};
var getQuestions = function (page) {
    return listQuestions(page)
        .then(function (ids) { return ids.map(function (id) { return getQuestionFromCache(id) || id; }); })
        .then(function (questions) {
        var newQuestionIds = questions
            .map(function (id, i) {
            if (typeof id === "string") {
                delete questions[i];
                return id;
            }
        })
            .filter(Boolean);
        if (newQuestionIds.length === 0)
            return questions;
        return fetchQuestions(newQuestionIds)
            .then(function (newQuestions) {
            newQuestions.forEach(setQuestionInCache);
            return questions.concat(newQuestions);
        });
    });
};
var addQuestion = function (data) {
    delete data;
    return Promise.reject(new Error("not implemented"));
};
var deleteQuestion = function (id) {
    delete id;
    return Promise.reject(new Error("not implemented"));
};
var getReplys = function (questionId, page) {
    return listReplys(questionId, page)
        .then(function (ids) { return ids.map(function (id) { return getReplyFromCache(id) || id; }); })
        .then(function (replys) {
        var newReplyIds = replys
            .map(function (id, i) {
            if (typeof id === "string") {
                delete replys[i];
                return id;
            }
        })
            .filter(Boolean);
        if (newReplyIds.length === 0)
            return replys;
        return fetchReplys(questionId, newReplyIds)
            .then(function (newReplys) {
            newReplys.forEach(setReplyInCache);
            return replys.concat(newReplys);
        });
    });
};
var addReply = function (questionId, data) {
    delete questionId;
    delete data;
    return Promise.reject(new Error("not implemented"));
};
var deleteReply = function (replyId) {
    delete replyId;
    return Promise.reject(new Error("not implemented"));
};
//# sourceMappingURL=questions.js.map