let currentQuiz = [];
let startTime = null;
let timerInterval = null;
let selectedFile = '';
let isTimeUp = false;

document.addEventListener('DOMContentLoaded', () => {
    loadAvailableFiles();
    setupEventListeners();
});

function loadAvailableFiles() {
    fetch('/api/files')
        .then(res => res.json())
        .then(files => {
            const select = document.getElementById('csv-select');
            select.innerHTML = '<option value="">단어장을 선택하세요</option>';
            files.forEach(file => {
                const option = document.createElement('option');
                option.value = file;
                option.textContent = file;
                select.appendChild(option);
            });
            if (files.includes('problems.csv')) {
                select.value = 'problems.csv';
            }
        })
        .catch(err => console.error('Failed to load files:', err));
}

function setupEventListeners() {
    document.getElementById('upload-btn').addEventListener('click', uploadFile);
    document.getElementById('start-quiz').addEventListener('click', startQuiz);
    document.getElementById('submit-quiz').addEventListener('click', () => {
        if (!isTimeUp) {
            submitQuiz();
        }
    });
    document.getElementById('retry-quiz').addEventListener('click', retryQuiz);
    document.getElementById('new-quiz').addEventListener('click', newQuiz);
    
    document.getElementById('csv-select').addEventListener('change', (e) => {
        selectedFile = e.target.value;
    });
}

function uploadFile() {
    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('파일을 선택해주세요.');
        return;
    }
    
    if (!file.name.endsWith('.csv')) {
        alert('CSV 파일만 업로드 가능합니다.');
        return;
    }
    
    const formData = new FormData();
    formData.append('csvFile', file);
    
    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        alert('파일이 업로드되었습니다.');
        loadAvailableFiles();
        fileInput.value = '';
    })
    .catch(err => {
        console.error('Upload failed:', err);
        alert('업로드에 실패했습니다.');
    });
}

function startQuiz() {
    const filename = selectedFile || document.getElementById('csv-select').value;
    
    if (!filename) {
        alert('단어장을 선택해주세요.');
        return;
    }
    
    fetch(`/api/quiz/${filename}?count=20`)
        .then(res => res.json())
        .then(quiz => {
            if (quiz.error) {
                alert(quiz.error);
                return;
            }
            currentQuiz = quiz;
            displayQuiz();
            startTimer();
        })
        .catch(err => {
            console.error('Failed to start quiz:', err);
            alert('시험을 시작할 수 없습니다.');
        });
}

function displayQuiz() {
    document.getElementById('file-selector').style.display = 'none';
    document.getElementById('quiz-container').style.display = 'block';
    document.getElementById('results').style.display = 'none';
    
    const container = document.getElementById('quiz-questions');
    container.innerHTML = '';
    
    currentQuiz.forEach((question, index) => {
        const div = document.createElement('div');
        div.className = 'quiz-question';
        div.innerHTML = `
            <div class="question-header">
                <div class="question-number">${question.id}</div>
                <div class="first-letter">${question.firstLetter}</div>
                <div class="meaning">${question.meaning}</div>
            </div>
            <input type="text"
                   class="answer-input"
                   id="answer-${index}"
                   placeholder="전체 단어를 입력하세요"
                   data-index="${index}"
                   autocomplete="off"
                   autocorrect="off"
                   autocapitalize="off"
                   spellcheck="false">
        `;
        container.appendChild(div);
    });
    
    const inputs = document.querySelectorAll('.answer-input');
    inputs.forEach((input, index) => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && index < inputs.length - 1) {
                inputs[index + 1].focus();
            }
        });
        
        input.addEventListener('input', () => {
            if (isTimeUp) {
                input.value = '';
                input.disabled = true;
            }
        });
    });
    
    if (inputs.length > 0) {
        inputs[0].focus();
    }
}


function startTimer() {
    startTime = Date.now();
    isTimeUp = false;
    const timer = document.getElementById('timer');
    timer.style.display = 'block';
    timer.classList.remove('warning');

    timerInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;

        timer.textContent =
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

        // 5분 경과시 타이머 위치 변경 및 경고
        if (elapsed === 300) {
            timer.classList.add('warning');
        }

        // 6분 경과시 시험 종료
        if (elapsed >= 360 && !isTimeUp) {
            isTimeUp = true;
            showTimeoutPopup();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
    const timer = document.getElementById('timer');
    timer.style.display = 'none';
    timer.classList.remove('warning');
}

function showTimeoutPopup() {
    // 모든 입력 필드 비활성화
    document.querySelectorAll('.answer-input').forEach(input => {
        input.disabled = true;
    });
    document.getElementById('submit-quiz').disabled = true;

    // 팝업 표시
    const overlay = document.getElementById('timeout-overlay');
    overlay.style.display = 'flex';

    // 강제 제출 버튼 이벤트
    document.getElementById('force-submit').addEventListener('click', () => {
        overlay.style.display = 'none';
        submitQuiz();
    });
}

function submitQuiz() {
    const answers = [];
    document.querySelectorAll('.answer-input').forEach(input => {
        answers.push(input.value.trim());
    });
    
    fetch('/api/submit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            answers: answers,
            quiz: currentQuiz
        })
    })
    .then(res => res.json())
    .then(result => {
        stopTimer();
        displayResults(result);
    })
    .catch(err => {
        console.error('Failed to submit quiz:', err);
        alert('제출에 실패했습니다.');
    });
}

function displayResults(result) {
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results').style.display = 'block';
    
    document.getElementById('score-display').textContent = `${result.score}/${result.total}`;
    document.getElementById('percentage').textContent = `${result.percentage}%`;
    
    const wrongContainer = document.getElementById('wrong-answers');
    wrongContainer.innerHTML = '<h3>전체 문제 결과</h3>';

    const allAnswersDiv = document.createElement('div');
    allAnswersDiv.className = 'all-answers';

    result.results.forEach(item => {
        const div = document.createElement('div');
        div.className = `answer-item ${item.isCorrect ? 'correct' : 'wrong'}`;
        div.innerHTML = `
            <div>
                <strong>문제 ${item.id}.</strong> ${item.meaning}
            </div>
            <div>
                ${item.isCorrect ? '✅' : '❌'}
                답안: <span class="${item.isCorrect ? 'correct-answer' : 'user-answer'}">
                    ${item.userAnswer || '(미입력)'}
                </span>
                ${!item.isCorrect ? `→ <span class="correct-answer">${item.correctAnswer}</span>` : ''}
            </div>
        `;
        allAnswersDiv.appendChild(div);
    });

    wrongContainer.appendChild(allAnswersDiv);

    if (result.score === result.total) {
        const perfectDiv = document.createElement('div');
        perfectDiv.innerHTML = '<h3 style="text-align: center; color: #28a745; margin-top: 20px;">🎉 완벽합니다! 모든 문제를 맞추셨습니다!</h3>';
        wrongContainer.appendChild(perfectDiv);
    }
    
    const quizQuestions = document.querySelectorAll('.quiz-question');
    result.results.forEach((item, index) => {
        if (quizQuestions[index]) {
            quizQuestions[index].classList.add(item.isCorrect ? 'correct' : 'wrong');
        }
    });
}

function retryQuiz() {
    isTimeUp = false;
    startQuiz();
}

function newQuiz() {
    isTimeUp = false;
    document.getElementById('file-selector').style.display = 'block';
    document.getElementById('quiz-container').style.display = 'none';
    document.getElementById('results').style.display = 'none';
    document.getElementById('timeout-overlay').style.display = 'none';
    stopTimer();
}