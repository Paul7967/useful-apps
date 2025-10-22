/**
 * Игровой экран "Состав числа"
 */
class CompositionGameScreen extends BaseScreen {
    constructor(app) {
        super(app, 'composition-game');
        this.storageService = app.services.storage;
        this.timerService = app.services.timer;
        
        // Состояние игры
        this.currentNumber = 0;
        this.numberRange = [];
        this.originalRange = { min: 1, max: 20 }; // Исходный диапазон по умолчанию
        this.repetitions = 1; // Количество повторений
        this.currentRepetition = 1; // Текущее повторение
        this.currentNumberIndex = 0; // Индекс текущего числа в массиве
        this.selectedButtons = new Set();
        this.gameStartTime = null;
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.wrongExamples = [];
        this.totalExamples = 0; // Общее количество примеров
        this.remainingExamples = 0; // Количество оставшихся примеров
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        super.bindEvents();
        
        // Кнопка "Следующее число"
        this.addEventListener('nextCompositionNumber', 'click', () => {
            this.nextNumber();
        });

        // Кнопка "Начать заново"
        this.addEventListener('restartComposition', 'click', () => {
            this.restartGame();
        });

        console.log('🎮 [CompositionGameScreen] События привязаны');
    }

    /**
     * Обработчик показа экрана
     */
    onShow() {
        console.log('🎮 [CompositionGameScreen] Показываем игровой экран Состав числа');
    }

    /**
     * Начало игры
     */
    startGame(range, repetitions = 1) {
        console.log('🎮 [CompositionGameScreen] Начало игры с диапазоном:', range, 'повторений:', repetitions);
        
        // Сохраняем количество повторений
        this.repetitions = repetitions;
        this.currentRepetition = 1;
        
        // Парсим диапазон
        this.parseRange(range);
        
        // Инициализируем игру
        this.initializeGame();
        
        // Генерируем первое число
        this.generateNextNumber();
    }

    /**
     * Парсинг диапазона чисел
     */
    parseRange(range) {
        const [min, max] = range.split('-').map(Number);
        this.originalRange = { min, max }; // Сохраняем исходный диапазон
        
        // Создаем полный список чисел с повторениями
        this.numberRange = [];
        for (let repetition = 1; repetition <= this.repetitions; repetition++) {
            for (let i = min; i <= max; i++) {
                this.numberRange.push(i);
            }
        }
        
        // Перемешиваем числа для случайного порядка
        this.shuffleArray(this.numberRange);
        
        // Рассчитываем общее количество примеров по формуле: ((a1-a2)/2+1)*(a2-a1+1)*n
        this.totalExamples = this.calculateTotalExamples(min, max, this.repetitions);
        this.remainingExamples = this.totalExamples;
        
        console.log('🔢 [CompositionGameScreen] Диапазон чисел:', this.numberRange);
        console.log('🔢 [CompositionGameScreen] Исходный диапазон:', this.originalRange);
        console.log('🔢 [CompositionGameScreen] Количество повторений:', this.repetitions);
        console.log('🔢 [CompositionGameScreen] Всего чисел:', this.numberRange.length);
        console.log('🔢 [CompositionGameScreen] Общее количество примеров:', this.totalExamples);
    }

    /**
     * Расчет общего количества примеров по формуле: ((a2-a1)/2+1)*(a2-a1+1)*n
     */
    calculateTotalExamples(min, max, repetitions) {
        const rangeSize = max - min + 1;
        const examplesPerNumber = (max + min) / 2 + 1;
        const totalExamples = examplesPerNumber * rangeSize * repetitions;
        
        console.log({rangeSize, examplesPerNumber, totalExamples});
        

        console.log('🧮 [CompositionGameScreen] Расчет примеров:', {
            min: min,
            max: max,
            repetitions: repetitions,
            rangeSize: rangeSize,
            examplesPerNumber: examplesPerNumber,
            totalExamples: totalExamples
        });
        
        return totalExamples;
    }

    /**
     * Инициализация игры
     */
    initializeGame() {
        this.selectedButtons.clear();
        this.correctAnswers = 0;
        this.incorrectAnswers = 0;
        this.wrongExamples = [];
        this.gameStartTime = Date.now();
        this.remainingExamples = this.totalExamples;
        this.currentNumberIndex = 0; // Сбрасываем индекс
        this.currentRepetition = 1; // Начинаем с первого повторения
        
        // Обновляем отображение диапазона
        const rangeText = `${this.originalRange.min} - ${this.originalRange.max}`;
        this.setText('currentRange', rangeText);
        
        // Устанавливаем начальное значение повторения
        this.setText('currentRepetition', this.currentRepetition);
        
        // Устанавливаем начальное значение оставшихся примеров
        this.setText('remainingExamples', this.remainingExamples);
        
        // Запускаем таймер
        this.timerService.start();
        this.updateTimer();
    }

    /**
     * Генерация следующего числа
     */
    generateNextNumber() {
        if (this.currentNumberIndex >= this.numberRange.length) {
            this.endGame();
            return;
        }
        
        // Берем следующее число из списка
        this.currentNumber = this.numberRange[this.currentNumberIndex];
        this.currentNumberIndex++;
        
        // Определяем текущее повторение
        const numbersInRange = this.originalRange.max - this.originalRange.min + 1;
        this.currentRepetition = Math.ceil(this.currentNumberIndex / numbersInRange);
        
        console.log('🔢 [CompositionGameScreen] Новое число:', this.currentNumber, 'индекс:', this.currentNumberIndex - 1, 'повторение:', this.currentRepetition);
        
        // Обновляем отображение
        this.setText('currentNumber', this.currentNumber);
        this.setText('currentRepetition', this.currentRepetition);
        this.selectedButtons.clear();
        this.setText('selectedCount', '0');
        
        // Генерируем примеры
        console.log('🎯 [CompositionGameScreen] Генерация примеров для числа:', this.currentNumber);
        this.generateExamples();
    }

    /**
     * Генерация примеров для текущего числа
     */
    generateExamples() {
        const examplesContainer = this.getElement('compositionExamples');
        if (!examplesContainer) {
            console.error('❌ [CompositionGameScreen] Контейнер compositionExamples не найден');
            return;
        }
        
        console.log('🎯 [CompositionGameScreen] Начинаем генерацию примеров...');
        
        // Очищаем контейнер
        examplesContainer.innerHTML = '';
        
        // Генерируем правильные примеры (сумма = текущее число)
        const correctExamples = this.generateCorrectExamples();
        console.log('✅ [CompositionGameScreen] Правильных примеров:', correctExamples.length);
        
        // Генерируем неправильные примеры (сумма ±1, ±2 от текущего числа)
        const incorrectExamples = this.generateIncorrectExamples();
        console.log('❌ [CompositionGameScreen] Неправильных примеров:', incorrectExamples.length);
        
        // Объединяем и перемешиваем
        const allExamples = [...correctExamples, ...incorrectExamples];
        this.shuffleArray(allExamples);
        
        // Ограничиваем количество примеров согласно формуле: (число + 2) * 1.6
        const maxExamples = Math.ceil((this.currentNumber + 2) * 1.6);
        const limitedExamples = allExamples.slice(0, maxExamples);
        
        console.log('🎯 [CompositionGameScreen] Максимальное количество примеров:', maxExamples);
        console.log('🎯 [CompositionGameScreen] Ограничено до:', limitedExamples.length);
        
        console.log('🎯 [CompositionGameScreen] Всего примеров:', limitedExamples.length);
        
        // Создаем кнопки
        limitedExamples.forEach((example, index) => {
            const button = document.createElement('button');
            button.className = 'composition-example-btn';
            button.textContent = example.text;
            button.dataset.result = example.result;
            button.dataset.isCorrect = example.isCorrect;
            button.dataset.index = index;
            
            button.addEventListener('click', () => {
                this.toggleButton(button);
            });
            
            examplesContainer.appendChild(button);
        });
        
        console.log('🎯 [CompositionGameScreen] Кнопки созданы и добавлены в DOM');
    }

    /**
     * Генерация правильных примеров
     */
    generateCorrectExamples() {
        const examples = [];
        
        // Генерируем все возможные комбинации для текущего числа
        for (let i = 0; i <= this.currentNumber; i++) {
            const j = this.currentNumber - i;
            examples.push({
                text: `${i} + ${j}`,
                result: this.currentNumber,
                isCorrect: true
            });
        }
        
        return examples;
    }

    /**
     * Генерация неправильных примеров
     */
    generateIncorrectExamples() {
        const examples = [];
        const targetNumber = this.currentNumber;
        
        // Генерируем примеры с результатом ±1, ±2 от целевого числа
        const offsets = [-2, -1, 1, 2];
        
        for (const offset of offsets) {
            const result = targetNumber + offset;
            if (result < 0) continue; // Не генерируем отрицательные результаты
            
            // Генерируем по 1 примеру для каждого offset
            const a = Math.floor(Math.random() * Math.max(1, result));
            const b = result - a;
            if (b >= 0) {
                examples.push({
                    text: `${a} + ${b}`,
                    result: result,
                    isCorrect: false
                });
            }
        }
        
        return examples;
    }

    /**
     * Переключение состояния кнопки
     */
    toggleButton(button) {
        const index = button.dataset.index;
        
        if (this.selectedButtons.has(index)) {
            // Убираем из выбранных
            this.selectedButtons.delete(index);
            button.classList.remove('selected');
            // Увеличиваем количество оставшихся примеров
            this.remainingExamples++;
        } else {
            // Добавляем в выбранные
            this.selectedButtons.add(index);
            button.classList.add('selected');
            // Уменьшаем количество оставшихся примеров
            this.remainingExamples--;
        }
        
        // Обновляем счетчики
        this.setText('selectedCount', this.selectedButtons.size);
        this.setText('remainingExamples', this.remainingExamples);
        
        console.log('🔢 [CompositionGameScreen] Оставшихся примеров:', this.remainingExamples);
    }

    /**
     * Переход к следующему числу
     */
    nextNumber() {
        console.log('➡️ [CompositionGameScreen] Переход к следующему числу');
        
        // Подсчитываем результаты для текущего числа
        this.calculateResults();
        
        // Генерируем следующее число
        this.generateNextNumber();
    }

    /**
     * Подсчет результатов для текущего числа
     */
    calculateResults() {
        const buttons = this.element.querySelectorAll('.composition-example-btn');
        
        buttons.forEach(button => {
            const isSelected = this.selectedButtons.has(button.dataset.index);
            const isCorrect = button.dataset.isCorrect === 'true';
            const result = parseInt(button.dataset.result);
            
            if (isCorrect && isSelected) {
                // Правильно выбрали правильный пример
                this.correctAnswers++;
            } else if (isCorrect && !isSelected) {
                // Не выбрали правильный пример
                this.incorrectAnswers++;
                this.wrongExamples.push({
                    example: button.textContent,
                    userAnswer: 'не выбрано',
                    correctAnswer: 'выбрать'
                });
            } else if (!isCorrect && isSelected) {
                // Выбрали неправильный пример
                this.incorrectAnswers++;
                this.wrongExamples.push({
                    example: button.textContent,
                    userAnswer: 'выбрано',
                    correctAnswer: 'не выбирать'
                });
            }
        });
        
        console.log('📊 [CompositionGameScreen] Результаты:', {
            correct: this.correctAnswers,
            incorrect: this.incorrectAnswers
        });
    }

    /**
     * Завершение игры
     */
    endGame() {
        console.log('🏁 [CompositionGameScreen] Игра завершена');
        
        // Останавливаем таймер
        this.timerService.stop();
        
        // Сохраняем результаты
        this.saveGameResults();
        
        // Переходим к экрану результатов
        this.app.showCompositionResults({
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            wrongExamples: this.wrongExamples,
            gameTime: this.timerService.getElapsedTime()
        });
    }

    /**
     * Сохранение результатов игры
     */
    saveGameResults() {
        const gameData = {
            id: Date.now(),
            date: new Date().toISOString(),
            type: 'composition',
            correctAnswers: this.correctAnswers,
            incorrectAnswers: this.incorrectAnswers,
            gameTime: this.timerService.getElapsedTime(),
            playerName: this.storageService.loadPlayerName(),
            range: this.originalRange ? `${this.originalRange.min}-${this.originalRange.max}` : 'Неизвестно',
            minNumber: this.originalRange ? this.originalRange.min : null,
            maxNumber: this.originalRange ? this.originalRange.max : null,
            repetitions: this.repetitions
        };
        
        this.storageService.saveCompositionGame(gameData);
        console.log('💾 [CompositionGameScreen] Результаты сохранены:', gameData);
    }

    /**
     * Перезапуск игры
     */
    restartGame() {
        console.log('🔄 [CompositionGameScreen] Перезапуск игры');
        
        // Останавливаем таймер
        this.timerService.stop();
        
        // Возвращаемся к экрану настроек
        this.app.showScreen('composition');
    }

    /**
     * Обновление таймера
     */
    updateTimer() {
        const elapsed = this.timerService.getElapsedTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        const timeText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        this.setText('compositionTimer', timeText);
        
        // Обновляем каждую секунду
        if (this.timerService.isRunning) {
            setTimeout(() => this.updateTimer(), 1000);
        }
    }

    /**
     * Перемешивание массива
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}
