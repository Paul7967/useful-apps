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
        this.minNumber = 1;
        this.maxNumber = 10;
        this.totalExamples = 5;
        this.operationType = 'addition';
    }

    /**
     * Инициализация игры с настройками
     */
    initGame(settings) {
        console.log('🎮 [GameService] Инициализация игры с настройками:', settings);
        
        this.minNumber = settings.minNumber || 1;
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
        // Для сложения: оба слагаемых должны быть в диапазоне [minNumber, maxNumber]
        // сумма не должна превышать maxNumber
        // и результат должен быть >= minNumber
        // a может быть от minNumber до (maxNumber - minNumber), чтобы b могло быть >= minNumber
        const maxA = this.maxNumber - this.minNumber;
        const minA = this.minNumber;
        const rangeA = maxA - minA + 1;
        const a = Math.floor(Math.random() * rangeA) + minA;
        // b может быть от minNumber до (maxNumber - a)
        const maxB = this.maxNumber - a;
        const minB = this.minNumber;
        const b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
        const result = a + b;
        
        // Проверка: результат должен быть >= minNumber
        // Если a >= minNumber и b >= minNumber, то result >= 2*minNumber >= minNumber (для minNumber >= 1)
        // Но для надежности проверяем явно
        if (result < this.minNumber) {
            console.warn(`⚠️ [GameService] Результат ${result} меньше minNumber ${this.minNumber}, перегенерируем`);
            // Перегенерируем пример
            return this.generateAdditionExample();
        }
        
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
        // Для вычитания: 
        // - уменьшаемое должно быть в диапазоне [minNumber, maxNumber]
        // - вычитаемое должно быть >= minNumber и < уменьшаемого
        // - результат должен быть >= minNumber
        // Это означает, что a должно быть >= 2*minNumber (чтобы a - b >= minNumber при b >= minNumber)
        const minA = 2 * this.minNumber;
        const maxA = this.maxNumber;
        const rangeA = maxA - minA + 1;
        
        if (rangeA <= 0) {
            console.error('❌ [GameService] Невозможно сгенерировать пример: диапазон для уменьшаемого пуст');
            // Fallback: используем минимально возможные значения
            const a = Math.max(2 * this.minNumber, this.minNumber + 1);
            const b = this.minNumber;
            const result = a - b;
            return {
                type: 'subtraction',
                a: a,
                b: b,
                result: result,
                text: `${a} - ${b} = `,
                correctAnswer: result
            };
        }
        
        let a = Math.floor(Math.random() * rangeA) + minA;
        console.log(`🎲 [GameService] Уменьшаемое a = ${a}`);
        
        // Вычитаемое должно быть >= minNumber и <= (a - minNumber), чтобы результат >= minNumber
        const minB = this.minNumber;
        const maxB = a - this.minNumber; // Чтобы результат был >= minNumber
        // Проверяем, что диапазон для b валиден
        if (maxB < minB) {
            console.warn(`⚠️ [GameService] Некорректный диапазон для b: maxB=${maxB} < minB=${minB}, перегенерируем a`);
            return this.generateSubtractionExample(hasZeroResult);
        }
        
        let b = Math.floor(Math.random() * (maxB - minB + 1)) + minB;
        let result = a - b;
        console.log(`🎲 [GameService] Первоначальные значения: a=${a}, b=${b}, result=${result}`);
        
        // Проверка: результат должен быть >= minNumber
        if (result < this.minNumber) {
            console.warn(`⚠️ [GameService] Результат ${result} меньше minNumber ${this.minNumber}, корректируем`);
            // Корректируем b, чтобы результат был >= minNumber
            b = Math.min(b, a - this.minNumber);
            result = a - b;
            console.log(`🎲 [GameService] Скорректированные значения: a=${a}, b=${b}, result=${result}`);
        }
        
        // Если результат 0 уже был в раунде, избегаем его
        if (hasZeroResult && result === 0) {
            console.log('🎲 [GameService] Результат 0, пытаемся избежать');
            // Увеличиваем a, чтобы гарантировать результат >= minNumber
            if (a < 2 * this.minNumber + 1) {
                a = Math.max(2 * this.minNumber + 1, minA);
                console.log(`🎲 [GameService] Увеличиваем a до ${a}`);
            }
            // Пересчитываем диапазон для b
            const newMinB = this.minNumber;
            const newMaxB = a - this.minNumber;
            if (newMaxB < newMinB) {
                console.warn(`⚠️ [GameService] Некорректный диапазон после увеличения a, перегенерируем`);
                return this.generateSubtractionExample(hasZeroResult);
            }
            // Генерируем заново, пока не получим результат >= minNumber и > 0
            let attempts = 0;
            do {
                attempts++;
                console.log(`🎲 [GameService] Попытка избежать 0, итерация ${attempts}`);
                b = Math.floor(Math.random() * (newMaxB - newMinB + 1)) + newMinB;
                result = a - b;
                console.log(`🎲 [GameService] Попытка ${attempts}: a=${a}, b=${b}, result=${result}`);
                
                if (attempts > 100) {
                    console.error('🚨 [GameService] ПРЕВЫШЕНО КОЛИЧЕСТВО ПОПЫТОК! Возможен бесконечный цикл!');
                    break;
                }
            } while (result === 0 || result < this.minNumber);
            console.log(`🎲 [GameService] Цикл избежания 0 завершен за ${attempts} попыток`);
        }
        
        // Финальная проверка: результат должен быть >= minNumber
        if (result < this.minNumber) {
            console.warn(`⚠️ [GameService] Результат ${result} все еще меньше minNumber ${this.minNumber}, перегенерируем`);
            return this.generateSubtractionExample(hasZeroResult);
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
