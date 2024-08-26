const baseUrl = 'https://opentdb.com/api.php?amount=10&type=multiple';
const topicUrls = {
    general: baseUrl,
    history: `${baseUrl}&category=23`,
    science: `${baseUrl}&category=17`,
    technical: `${baseUrl}&category=18`,
    current_affairs: 'https://example.com/api/current_affairs',
    states_of_india: 'https://example.com/api/states_of_india'
};

let quizData = [];
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = [];
let timer;
let timeLeft = 30;

const questionEl = document.getElementById('question');
const choicesContainerEl = document.getElementById('choices-container');
const submitBtn = document.getElementById('submit-btn');
const nextBtn = document.getElementById('next-btn');
const retakeBtn = document.getElementById('retake-btn');
const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('time');
const progressBarEl = document.getElementById('progress-bar');
const resultContainer = document.getElementById('result-container');
const quizContainer = document.getElementById('quiz-container');
const leaderboardContainer = document.getElementById('leaderboard-container');
const leaderboardEl = document.getElementById('leaderboard');
const showLeaderboardBtn = document.getElementById('show-leaderboard');
const closeLeaderboardBtn = document.getElementById('close-leaderboard');
const topicSelectionEl = document.getElementById('topic-selection');

nextBtn.addEventListener('click', loadNextQuestion);
retakeBtn.addEventListener('click', resetQuiz);
showLeaderboardBtn.addEventListener('click', showLeaderboard);
closeLeaderboardBtn.addEventListener('click', closeLeaderboard);

function startQuiz(topic) {
    topicSelectionEl.style.display = 'none';
    quizContainer.style.display = 'block';
    fetchQuizData(topic);
}

async function fetchQuizData(topic) {
    try {
        const response = await fetch(topicUrls[topic]);
        const data = await response.json();
        quizData = data.results.map(questionData => ({
            question: questionData.question,
            choices: [...questionData.incorrect_answers, questionData.correct_answer],
            correct: questionData.correct_answer
        }));
        startQuizSession();
    } catch (error) {
        console.error('Error fetching quiz data:', error);
    }
}

function startQuizSession() {
    loadQuestion();
    startTimer();
}

function loadQuestion() {
    if (currentQuestionIndex >= quizData.length) {
        showResults();
        return;
    }

    resetTimer();
    const currentQuestion = quizData[currentQuestionIndex];
    questionEl.innerHTML = currentQuestion.question;
    choicesContainerEl.innerHTML = '';

    const shuffledChoices = currentQuestion.choices.sort(() => Math.random() - 0.5);

    shuffledChoices.forEach((choice, index) => {
        const choiceContainer = document.createElement('div');
        choiceContainer.classList.add('choice');

        const choiceInput = document.createElement('input');
        choiceInput.type = 'radio';
        choiceInput.name = 'choice';
        choiceInput.id = `choice-${index}`;
        choiceInput.value = choice;

        const choiceLabel = document.createElement('label');
        choiceLabel.htmlFor = `choice-${index}`;
        choiceLabel.innerText = choice;

        choiceContainer.appendChild(choiceInput);
        choiceContainer.appendChild(choiceLabel);

        choicesContainerEl.appendChild(choiceContainer);
    });

    if (currentQuestionIndex === quizData.length - 1) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'block';
        submitBtn.style.display = 'none';
    }
}

function loadNextQuestion() {
const selectedChoice = document.querySelector('input[name="choice"]:checked');
if (selectedChoice) {
userAnswers.push(selectedChoice.value);
if (selectedChoice.value === quizData[currentQuestionIndex].correct) {
    score++;
}
currentQuestionIndex++;
loadQuestion();
}
// } else {
// alert('Please select an answer before proceeding.');
// }
}

function handleSubmit(event) {
event.preventDefault();
clearInterval(timer);
loadNextQuestion();
showResults();
}

function showResults() {
quizContainer.style.display = 'none';
resultContainer.style.display = 'block';
scoreEl.innerText = `${score} / ${quizData.length}`;
displayResults();
}

function displayResults() {
const resultListEl = document.getElementById('result-list');
resultListEl.innerHTML = '';

quizData.forEach((question, index) => {
const resultItem = document.createElement('li');
const userAnswer = userAnswers[index];
const correctAnswer = question.correct;

resultItem.innerHTML = `
    <strong>${question.question}</strong><br>
    Your answer: ${userAnswer} - ${userAnswer === correctAnswer ? 'Correct' : 'Incorrect'}
    ${userAnswer !== correctAnswer ? `<br>Correct answer: ${correctAnswer}` : ''}
`;
resultListEl.appendChild(resultItem);
});
}

function resetQuiz() {
currentQuestionIndex = 0;
score = 0;
userAnswers = [];
resultContainer.style.display = 'none';
topicSelectionEl.style.display = 'block';
}

function startTimer() {
timeLeft = 30;
timerEl.innerText = timeLeft;
timer = setInterval(() => {
timeLeft--;
timerEl.innerText = timeLeft;
if (timeLeft <= 0) {
    clearInterval(timer);
    loadNextQuestion();
}
}, 1000);
}

function resetTimer() {
clearInterval(timer);
startTimer();
}

function showLeaderboard() {
leaderboardContainer.style.display = 'block';
resultContainer.style.display = 'none';
updateLeaderboard();
}

function updateLeaderboard() {
leaderboardEl.innerHTML = '';
const leaderboard = JSON.parse(localStorage.getItem('leaderboard')) || [];
leaderboard.forEach((score, index) => {
const li = document.createElement('li');
li.innerText = `${index + 1}. Score: ${score}`;
leaderboardEl.appendChild(li);
});
}

function closeLeaderboard() {
leaderboardContainer.style.display = 'none';
}