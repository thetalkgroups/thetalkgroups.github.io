var questionApi = new Api("/group" + window.GROUP + "questions", function (question) { return !question || !question.question; });
var replyApi = function (questionId) { return new Api("/group" + window.GROUP + "questions/" + questionId + "/replys", function (_) { return false; }); };
//# sourceMappingURL=questions.js.map