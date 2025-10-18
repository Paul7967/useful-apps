class MathGame {
    constructor() {
        this.currentExample = 0;
        this.totalExamples = 0;
        this.score = 0;
        this.examples = [];
        this.wrongExamples = [];
        this.maxNumber = 10;
        this.isGameActive = false;
        this.gameStartTime = null;
        this.gameTimer = null;
        
        this.initializeElements();
        this.bindEvents();
    }
    
    initializeElements() {
        this.settingsDiv = document.getElementById('settings');
        this.gameScreen = document.getElementById('gameScreen');
        this.resultsDiv = document.getElementById('results');
        
        this.playerNameInput = document.getElementById('playerNameInput');
        this.playerNameSpan = document.getElementById('playerName');
        this.maxNumberInput = document.getElementById('maxNumber');
        this.examplesCountInput = document.getElementById('examplesCount');
        this.startGameBtn = document.getElementById('startGame');
        
        this.currentExampleSpan = document.getElementById('currentExample');
        this.totalExamplesSpan = document.getElementById('totalExamples');
        this.currentScoreSpan = document.getElementById('currentScore');
        this.gameTimerSpan = document.getElementById('gameTimer');
        this.exampleTextSpan = document.getElementById('exampleText');
        this.answerInput = document.getElementById('answerInput');
        this.nextExampleBtn = document.getElementById('nextExample');
        this.restartRoundBtn = document.getElementById('restartRound');
        this.newGameBtn = document.getElementById('newGame');
        
        this.finalScoreSpan = document.getElementById('finalScore');
        this.totalExamplesResultSpan = document.getElementById('totalExamplesResult');
        this.finalTimeSpan = document.getElementById('finalTime');
        this.wrongExamplesTitle = document.getElementById('wrongExamplesTitle');
        this.wrongExamplesList = document.getElementById('wrongExamplesList');
        this.playAgainBtn = document.getElementById('playAgain');
    }
    
    bindEvents() {
        this.startGameBtn.addEventListener('click', () => this.startGame());
        this.nextExampleBtn.addEventListener('click', () => this.nextExample());
        this.restartRoundBtn.addEventListener('click', () => this.restartRound());
        this.newGameBtn.addEventListener('click', () => this.newGame());
        this.playAgainBtn.addEventListener('click', () => this.playAgain());
        
        this.answerInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.nextExample();
            }
        });
        
        this.playerNameInput.addEventListener('input', () => {
            this.updatePlayerName();
            this.savePlayerName();
        });
        
        // Автосохранение настроек при изменении
        this.maxNumberInput.addEventListener('change', () => this.saveGameSettings());
        this.examplesCountInput.addEventListener('change', () => this.saveGameSettings());
        
        // Автосохранение типа операций при изменении
        document.querySelectorAll('input[name="operationType"]').forEach(radio => {
            radio.addEventListener('change', () => this.saveGameSettings());
        });
    }
    
    startGame() {
        console.log('🎮 [startGame] Начало запуска игры');
        
        // Убеждаемся, что предыдущая игра полностью остановлена
        this.stopTimer();
        this.isGameActive = false;
        
        this.maxNumber = parseInt(this.maxNumberInput.value);
        this.totalExamples = parseInt(this.examplesCountInput.value);
        
        console.log(`🎮 [startGame] Настройки: maxNumber=${this.maxNumber}, totalExamples=${this.totalExamples}`);
        
        if (this.maxNumber < 1 || this.totalExamples < 1) {
            console.log('❌ [startGame] Некорректные значения');
            alert('Пожалуйста, введите корректные значения (больше 0)');
            return;
        }
        
        // Настройки уже сохранены автоматически при изменении полей
        
        this.currentExample = 0;
        this.score = 0;
        this.examples = [];
        this.wrongExamples = [];
        this.isGameActive = true;
        
        console.log('🎮 [startGame] Состояние сброшено, начинаем генерацию примеров');
        this.generateExamples();
        console.log('🎮 [startGame] Примеры сгенерированы, показываем игровой экран');
        this.showGameScreen();
        console.log('🎮 [startGame] Запускаем таймер');
        this.startTimer();
        console.log('🎮 [startGame] Показываем первый пример');
        this.showCurrentExample();
        console.log('🎮 [startGame] Игра запущена успешно');
    }
    
    generateExamples() {
        console.log('🔄 [generateExamples] Начало генерации примеров');
        this.examples = [];
        let hasZeroResult = false;
        
        for (let i = 0; i < this.totalExamples; i++) {
            console.log(`🔄 [generateExamples] Генерируем пример ${i + 1}/${this.totalExamples}`);
            const example = this.generateRandomExample(hasZeroResult);
            console.log(`🔄 [generateExamples] Сгенерирован пример: ${example.text} = ${example.correctAnswer}`);
            this.examples.push(example);
            
            // Отмечаем, если получили результат 0
            if (example.correctAnswer === 0) {
                hasZeroResult = true;
                console.log('🔄 [generateExamples] Обнаружен результат 0, отмечаем для избежания повторения');
            }
        }
        console.log(`🔄 [generateExamples] Генерация завершена, создано ${this.examples.length} примеров`);
    }
    
    generateRandomExample(hasZeroResult = false) {
        console.log('🎲 [generateRandomExample] Начало генерации случайного примера');
        const operationType = document.querySelector('input[name="operationType"]:checked').value;
        let operation;
        
        console.log(`🎲 [generateRandomExample] Тип операции: ${operationType}, hasZeroResult: ${hasZeroResult}`);
        
        switch(operationType) {
            case 'addition':
                operation = 'addition';
                break;
            case 'subtraction':
                operation = 'subtraction';
                break;
            case 'both':
                operation = Math.random() < 0.5 ? 'addition' : 'subtraction';
                break;
            default:
                operation = 'addition';
        }
        
        console.log(`🎲 [generateRandomExample] Выбранная операция: ${operation}`);
        
        if (operation === 'addition') {
            // Для сложения: оба слагаемых и сумма не должны превышать maxNumber
            const a = Math.floor(Math.random() * this.maxNumber) + 1;
            const maxB = this.maxNumber - a;
            const b = Math.floor(Math.random() * maxB) + 1;
            const result = a + b;
            return {
                type: 'addition',
                a: a,
                b: b,
                result: result,
                text: `${a} + ${b} = `,
                correctAnswer: result
            };
        } else {
            console.log('🎲 [generateRandomExample] Генерируем пример на вычитание');
            // Для вычитания: уменьшаемое не должно превышать maxNumber
            // Генерируем уменьшаемое в пределах maxNumber
            let a = Math.floor(Math.random() * this.maxNumber) + 1;
            console.log(`🎲 [generateRandomExample] Уменьшаемое a = ${a}`);
            // Вычитаемое должно быть меньше уменьшаемого
            let b = Math.floor(Math.random() * a) + 1;
            let result = a - b;
            console.log(`🎲 [generateRandomExample] Первоначальные значения: a=${a}, b=${b}, result=${result}`);
            
            // Если результат 0 уже был в раунде, избегаем его
            if (hasZeroResult && result === 0) {
                console.log('🎲 [generateRandomExample] Результат 0, пытаемся избежать');
                // Если a = 1, то результат всегда будет 0, поэтому генерируем новое a
                if (a === 1) {
                    console.log('🎲 [generateRandomExample] a=1, генерируем новое a');
                    a = Math.floor(Math.random() * this.maxNumber) + 2; // Минимум 2
                    console.log(`🎲 [generateRandomExample] Новое a = ${a}`);
                }
                // Генерируем заново, пока не получим результат > 0
                let attempts = 0;
                do {
                    attempts++;
                    console.log(`🎲 [generateRandomExample] Попытка избежать 0, итерация ${attempts}`);
                    b = Math.floor(Math.random() * a) + 1;
                    result = a - b;
                    console.log(`🎲 [generateRandomExample] Попытка ${attempts}: a=${a}, b=${b}, result=${result}`);
                    
                    if (attempts > 100) {
                        console.error('🚨 [generateRandomExample] ПРЕВЫШЕНО КОЛИЧЕСТВО ПОПЫТОК! Возможен бесконечный цикл!');
                        break;
                    }
                } while (result === 0);
                console.log(`🎲 [generateRandomExample] Цикл избежания 0 завершен за ${attempts} попыток`);
            }
            
            return {
                type: 'subtraction',
                a: a,
                b: b,
                result: result,
                text: `${a} - ${b} = `,
                correctAnswer: result
            };
        }
    }
    
    showGameScreen() {
        this.settingsDiv.classList.add('hidden');
        this.resultsDiv.classList.add('hidden');
        this.gameScreen.classList.remove('hidden');
        
        this.totalExamplesSpan.textContent = this.totalExamples;
        this.currentScoreSpan.textContent = this.score;
    }
    
    showCurrentExample() {
        console.log(`📝 [showCurrentExample] Показываем пример ${this.currentExample + 1}/${this.totalExamples}`);
        
        if (this.currentExample >= this.totalExamples) {
            console.log('📝 [showCurrentExample] Достигнут конец примеров, завершаем игру');
            this.endGame();
            return;
        }
        
        const example = this.examples[this.currentExample];
        console.log(`📝 [showCurrentExample] Пример: ${example.text} (ответ: ${example.correctAnswer})`);
        this.exampleTextSpan.textContent = example.text;
        this.currentExampleSpan.textContent = this.currentExample + 1;
        
        this.answerInput.value = '';
        this.answerInput.focus();
        console.log('📝 [showCurrentExample] Пример показан, фокус на поле ввода');
    }
    
    nextExample() {
        console.log('➡️ [nextExample] Обработка ответа пользователя');
        
        if (!this.isGameActive) {
            console.log('➡️ [nextExample] Игра неактивна, выходим');
            return;
        }
        
        const userAnswer = parseInt(this.answerInput.value);
        const currentExample = this.examples[this.currentExample];
        
        console.log(`➡️ [nextExample] Ответ пользователя: ${userAnswer}, правильный ответ: ${currentExample.correctAnswer}`);
        
        if (isNaN(userAnswer)) {
            console.log('➡️ [nextExample] Некорректный ввод');
            alert('Пожалуйста, введите число');
            return;
        }
        
        if (userAnswer === currentExample.correctAnswer) {
            this.score++;
            console.log(`➡️ [nextExample] Правильный ответ! Счет: ${this.score}`);
        } else {
            this.wrongExamples.push({
                example: currentExample,
                userAnswer: userAnswer
            });
            console.log(`➡️ [nextExample] Неправильный ответ. Неправильных примеров: ${this.wrongExamples.length}`);
        }
        
        this.currentExample++;
        this.currentScoreSpan.textContent = this.score;
        console.log(`➡️ [nextExample] Переходим к примеру ${this.currentExample + 1}/${this.totalExamples}`);
        
        if (this.currentExample >= this.totalExamples) {
            console.log('➡️ [nextExample] Все примеры пройдены, завершаем игру');
            this.endGame();
        } else {
            console.log('➡️ [nextExample] Показываем следующий пример');
            this.showCurrentExample();
        }
    }
    
    endGame() {
        this.isGameActive = false;
        this.stopTimer();
        this.showResults();
    }
    
    showResults() {
        this.gameScreen.classList.add('hidden');
        this.resultsDiv.classList.remove('hidden');
        
        this.finalScoreSpan.textContent = this.score;
        this.totalExamplesResultSpan.textContent = this.totalExamples;
        this.finalTimeSpan.textContent = this.getGameTime();
        
        this.displayWrongExamples();
    }
    
    displayWrongExamples() {
        this.wrongExamplesList.innerHTML = '';
        
        if (this.wrongExamples.length === 0) {
            // Показываем сообщение о том, что все примеры решены правильно
            this.wrongExamplesTitle.textContent = 'Отлично!';
            
            const li = document.createElement('li');
            li.textContent = 'Все примеры решены правильно! 🎉';
            li.style.background = '#e8f5e8';
            li.style.borderColor = '#4CAF50';
            li.style.color = '#2e7d32';
            this.wrongExamplesList.appendChild(li);
        } else {
            // Показываем список неправильных примеров
            this.wrongExamplesTitle.textContent = 'Неправильно решенные примеры:';
            
            this.wrongExamples.forEach(wrongExample => {
                const li = document.createElement('li');
                li.textContent = `${wrongExample.example.text} Правильный ответ: ${wrongExample.example.correctAnswer}, Ваш ответ: ${wrongExample.userAnswer}`;
                this.wrongExamplesList.appendChild(li);
            });
        }
    }
    
    restartRound() {
        if (!this.isGameActive) return;
        
        // Сбрасываем прогресс текущего раунда
        this.currentExample = 0;
        this.score = 0;
        this.wrongExamples = [];
        
        // Перезапускаем таймер
        this.stopTimer();
        this.startTimer();
        
        // Генерируем новые примеры с теми же настройками
        this.generateExamples();
        
        // Обновляем интерфейс
        this.currentScoreSpan.textContent = this.score;
        this.showCurrentExample();
    }
    
    updatePlayerName() {
        const name = this.playerNameInput.value.trim();
        if (name) {
            this.playerNameSpan.textContent = name;
        } else {
            this.playerNameSpan.textContent = 'Игрок';
        }
    }
    
    savePlayerName() {
        const name = this.playerNameInput.value.trim();
        if (name) {
            localStorage.setItem('mathGamePlayerName', name);
            this.playerNameSpan.textContent = name;
        }
    }
    
    loadPlayerName() {
        const savedName = localStorage.getItem('mathGamePlayerName');
        if (savedName) {
            this.playerNameInput.value = savedName;
            this.playerNameSpan.textContent = savedName;
        }
    }
    
    saveGameSettings() {
        const operationType = document.querySelector('input[name="operationType"]:checked').value;
        const maxNumber = this.maxNumberInput.value;
        const examplesCount = this.examplesCountInput.value;
        
        localStorage.setItem('mathGameOperationType', operationType);
        localStorage.setItem('mathGameMaxNumber', maxNumber);
        localStorage.setItem('mathGameExamplesCount', examplesCount);
    }
    
    loadGameSettings() {
        // Загружаем тип операций
        const savedOperationType = localStorage.getItem('mathGameOperationType');
        if (savedOperationType) {
            const radioButton = document.querySelector(`input[name="operationType"][value="${savedOperationType}"]`);
            if (radioButton) {
                radioButton.checked = true;
            }
        }
        
        // Загружаем максимальное число
        const savedMaxNumber = localStorage.getItem('mathGameMaxNumber');
        if (savedMaxNumber) {
            this.maxNumberInput.value = savedMaxNumber;
        }
        
        // Загружаем количество примеров
        const savedExamplesCount = localStorage.getItem('mathGameExamplesCount');
        if (savedExamplesCount) {
            this.examplesCountInput.value = savedExamplesCount;
        }
    }
    
    startTimer() {
        console.log('⏰ [startTimer] Запуск таймера');
        this.gameStartTime = Date.now();
        this.gameTimer = setInterval(() => {
            this.updateTimer();
        }, 1000);
        console.log('⏰ [startTimer] Таймер запущен');
    }
    
    stopTimer() {
        console.log('⏰ [stopTimer] Остановка таймера');
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
            console.log('⏰ [stopTimer] Таймер остановлен');
        } else {
            console.log('⏰ [stopTimer] Таймер уже остановлен');
        }
    }
    
    updateTimer() {
        if (!this.gameStartTime) {
            console.log('⏰ [updateTimer] Время начала игры не установлено');
            return;
        }
        
        const elapsed = Date.now() - this.gameStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.gameTimerSpan.textContent = timeString;
        
        // Логируем каждые 10 секунд, чтобы не засорять консоль
        if (seconds % 10 === 0) {
            console.log(`⏰ [updateTimer] Прошло времени: ${timeString}`);
        }
    }
    
    getGameTime() {
        if (!this.gameStartTime) return '00:00';
        
        const elapsed = Date.now() - this.gameStartTime;
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    newGame() {
        console.log('🆕 [newGame] Запуск новой игры');
        
        // Останавливаем текущую игру
        this.isGameActive = false;
        this.stopTimer();
        
        // Сбрасываем состояние игры
        this.currentExample = 0;
        this.totalExamples = 0;
        this.score = 0;
        this.examples = [];
        this.wrongExamples = [];
        this.gameStartTime = null;
        
        console.log('🆕 [newGame] Состояние сброшено, возвращаемся к настройкам');
        
        // Переключаем экраны
        this.settingsDiv.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
        this.resultsDiv.classList.add('hidden');
        
        this.maxNumberInput.focus();
        console.log('🆕 [newGame] Новая игра запущена');
    }
    
    playAgain() {
        // Сбрасываем состояние игры
        this.currentExample = 0;
        this.totalExamples = 0;
        this.score = 0;
        this.examples = [];
        this.wrongExamples = [];
        this.isGameActive = false;
        this.gameStartTime = null;
        
        // Останавливаем таймер если он запущен
        this.stopTimer();
        
        // Переключаем экраны
        this.settingsDiv.classList.remove('hidden');
        this.gameScreen.classList.add('hidden');
        this.resultsDiv.classList.add('hidden');
        
        this.maxNumberInput.focus();
    }
}

// Функция инициализации версии
function initializeVersion() {
    if (window.APP_VERSION && window.APP_NAME && window.COPYRIGHT_YEAR) {
        // Обновляем мета-теги
        document.getElementById('version-meta').setAttribute('content', window.APP_VERSION);
        document.getElementById('generator-meta').setAttribute('content', `${window.APP_NAME} v${window.APP_VERSION}`);
        document.getElementById('page-title').textContent = `${window.APP_NAME} v${window.APP_VERSION}`;
        
        // Обновляем футер
        document.getElementById('footer-text').textContent = `${window.APP_NAME} v${window.APP_VERSION} | © ${window.COPYRIGHT_YEAR}`;
    }
}

// Инициализация игры при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Инициализируем версию
    initializeVersion();
    
    const game = new MathGame();
    game.loadPlayerName();
    game.loadGameSettings();
});
