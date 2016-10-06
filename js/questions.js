var questions = [
    {
        id: "1",
        user: {
            name: "mathias hansen",
            photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
        },
        date: 1475594718761,
        title: "question 1?",
        question: "Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo. Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.",
        answers: [
            {
                user: {
                    name: "mathias hansen",
                    photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
                },
                answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
                date: 1475594727900
            },
            {
                user: {
                    name: "mathias hansen",
                    photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
                },
                answer: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                date: 1475606300585
            }
        ]
    },
    {
        id: "2",
        user: {
            name: "mathias hansen",
            photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
        },
        date: 1475594718761,
        title: "question 2?",
        question: "At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio.",
        answers: [
            {
                user: {
                    name: "mathias hansen",
                    photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
                },
                answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. ",
                date: 1475594727900
            },
            {
                user: {
                    name: "mathias hansen",
                    photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
                },
                answer: "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.",
                date: 1475606300585
            }
        ]
    }
];
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