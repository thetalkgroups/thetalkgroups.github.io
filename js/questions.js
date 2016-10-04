let QUESTIONS;
const loadQuestions = () => {
    QUESTIONS = [
        {
            id: "1",
            user: {
                name: "mathias hansen",
                photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
            },
            date: 1475594718761,
            title: "question 1?",
            question: "i want to ask something",
            answers: [
                {
                    user: {
                        name: "mathias hansen",
                        photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
                    },
                    answer: "answer 1!",
                    date: 1475594727900
                },
                {
                    user: {
                        name: "mathias hansen",
                        photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
                    },
                    answer: "answer 2!",
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
            question: "i want to ask something",
            answers: [
                {
                    user: {
                        name: "mathias hansen",
                        photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
                    },
                    answer: "answer 1!",
                    date: 1475594727900
                },
                {
                    user: {
                        name: "mathias hansen",
                        photo: "https://lh4.googleusercontent.com/-LE9x7nwRVic/AAAAAAAAAAI/AAAAAAAAFQ0/Zi6P-VtAeKU/s96-c/photo.jpg"
                    },
                    answer: "answer 2!",
                    date: 1475606300585
                }
            ]
        }
    ];
}
const getQuestion = id => {
    let question = QUESTIONS.find(q => q.id === id)

    if (!question || question.answers) {
        // TODO fetch question
    }

    return question;
}

loadQuestions();