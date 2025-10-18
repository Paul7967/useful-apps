/**
 * Сервис для игровой логики
 * Отвечает за генерацию примеров, проверку ответов и подсчет очков
 */
class GameService {
    constructor() {
        this.currentExample = 0;
        this.score = 0;
        this.examples = [];
        this.wrongExamples = [];
        this.maxNumber = 10;
        this.totalExamples = 5;
        this.operationType = 'addition';
    }

    /**
     * Инициализация игры с настройками
     */
    initGame(settings) {
        console.log('🎮 [GameService] Инициализация игры с настройками:', settings);
        
        this.maxNumber = settings.maxNumber || 10;
        this.totalExamples = settings.examplesCount || 5;
        this.operationType = settings.operationType || 'addition';
        
        this.currentExample = 0;
        this.score = 0;
        this.examples = [];
        this.wrongExamples = [];
        
        this.generateExamples();
        console.log(`🎮 [GameService] Сгенерировано ${this.examples.length} примеров`);
    }

    /**
     * Генерация всех примеров для раунда
     */
    generateExamples() {
        console.log('🔄 [GameService] Начало генерации примеров');
        this.examples = [];
        let hasZeroResult = false;
        
        for (let i = 0; i < this.totalExamples; i++) {
            console.log(`🔄 [GameService] Генерируем пример ${i + 1}/${this.totalExamples}`);
            const example = this.generateRandomExample(hasZeroResult);
            console.log(`🔄 [GameService] Сгенерирован пример: ${example.text} = ${example.correctAnswer}`);
            this.examples.push(example);
            
            // Отмечаем, если получили результат 0
            if (example.correctAnswer === 0) {
                hasZeroResult = true;
                console.log('🔄 [GameService] Обнаружен результат 0, отмечаем для избежания повторения');
            }
        }
        console.log(`🔄 [GameService] Генерация завершена, создано ${this.examples.length} примеров`);
    }

    /**
     * Генерация одного случайного примера
     */
    generateRandomExample(hasZeroResult = false) {
        console.log('🎲 [GameService] Начало генерации случайного примера');
        console.log(`🎲 [GameService] Тип операции: ${this.operationType}, hasZeroResult: ${hasZeroResult}`);
        
        let operation;
        switch(this.operationType) {
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
        
        console.log(`🎲 [GameService] Выбранная операция: ${operation}`);
        
        if (operation === 'addition') {
            return this.generateAdditionExample();
        } else {
            return this.generateSubtractionExample(hasZeroResult);
        }
    }

    /**
     * Генерация примера на сложение
     */
    generateAdditionExample() {
        console.log('🎲 [GameService] Генерируем пример на сложение');
        // Для сложения: оба слагаемых и сумма не должны превышать maxNumber
        const a = Math.floor(Math.random() * this.maxNumber) + 1;
        const maxB = this.maxNumber - a;
        const b = Math.floor(Math.random() * maxB) + 1;
        const result = a + b;
        
        console.log(`🎲 [GameService] Сложение: a=${a}, b=${b}, result=${result}`);
        
        return {
            type: 'addition',
            a: a,
            b: b,
            result: result,
            text: `${a} + ${b} = `,
            correctAnswer: result
        };
    }

    /**
     * Генерация примера на вычитание
     */
    generateSubtractionExample(hasZeroResult = false) {
        console.log('🎲 [GameService] Генерируем пример на вычитание');
        // Для вычитания: уменьшаемое не должно превышать maxNumber
        let a = Math.floor(Math.random() * this.maxNumber) + 1;
        console.log(`🎲 [GameService] Уменьшаемое a = ${a}`);
        
        // Вычитаемое должно быть меньше уменьшаемого
        let b = Math.floor(Math.random() * a) + 1;
        let result = a - b;
        console.log(`🎲 [GameService] Первоначальные значения: a=${a}, b=${b}, result=${result}`);
        
        // Если результат 0 уже был в раунде, избегаем его
        if (hasZeroResult && result === 0) {
            console.log('🎲 [GameService] Результат 0, пытаемся избежать');
            // Если a = 1, то результат всегда будет 0, поэтому генерируем новое a
            if (a === 1) {
                console.log('🎲 [GameService] a=1, генерируем новое a');
                a = Math.floor(Math.random() * this.maxNumber) + 2; // Минимум 2
                console.log(`🎲 [GameService] Новое a = ${a}`);
            }
            // Генерируем заново, пока не получим результат > 0
            let attempts = 0;
            do {
                attempts++;
                console.log(`🎲 [GameService] Попытка избежать 0, итерация ${attempts}`);
                b = Math.floor(Math.random() * a) + 1;
                result = a - b;
                console.log(`🎲 [GameService] Попытка ${attempts}: a=${a}, b=${b}, result=${result}`);
                
                if (attempts > 100) {
                    console.error('🚨 [GameService] ПРЕВЫШЕНО КОЛИЧЕСТВО ПОПЫТОК! Возможен бесконечный цикл!');
                    break;
                }
            } while (result === 0);
            console.log(`🎲 [GameService] Цикл избежания 0 завершен за ${attempts} попыток`);
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

    /**
     * Получение текущего примера
     */
    getCurrentExample() {
        if (this.currentExample >= this.examples.length) {
            return null;
        }
        return this.examples[this.currentExample];
    }

    /**
     * Проверка ответа пользователя
     */
    checkAnswer(userAnswer) {
        const currentExample = this.getCurrentExample();
        if (!currentExample) {
            return { correct: false, message: 'Нет активного примера' };
        }

        const userNum = parseInt(userAnswer);
        if (isNaN(userNum)) {
            return { correct: false, message: 'Пожалуйста, введите число' };
        }

        const isCorrect = userNum === currentExample.correctAnswer;
        
        if (isCorrect) {
            this.score++;
            console.log(`✅ [GameService] Правильный ответ! Счет: ${this.score}`);
        } else {
            this.wrongExamples.push({
                example: currentExample,
                userAnswer: userNum
            });
            console.log(`❌ [GameService] Неправильный ответ. Неправильных примеров: ${this.wrongExamples.length}`);
        }

        return {
            correct: isCorrect,
            correctAnswer: currentExample.correctAnswer,
            userAnswer: userNum,
            score: this.score
        };
    }

    /**
     * Переход к следующему примеру
     */
    nextExample() {
        this.currentExample++;
        console.log(`➡️ [GameService] Переходим к примеру ${this.currentExample + 1}/${this.totalExamples}`);
        return this.getCurrentExample();
    }

    /**
     * Проверка завершения игры
     */
    isGameFinished() {
        return this.currentExample >= this.totalExamples;
    }

    /**
     * Получение результатов игры
     */
    getGameResults() {
        return {
            score: this.score,
            totalExamples: this.totalExamples,
            wrongExamples: this.wrongExamples,
            percentage: Math.round((this.score / this.totalExamples) * 100)
        };
    }

    /**
     * Сброс игры
     */
    resetGame() {
        console.log('🔄 [GameService] Сброс игры');
        this.currentExample = 0;
        this.score = 0;
        this.examples = [];
        this.wrongExamples = [];
    }

    /**
     * Перезапуск игры с теми же настройками
     */
    restartGame() {
        console.log('🔄 [GameService] Перезапуск игры');
        this.resetGame();
        this.generateExamples();
    }
}
