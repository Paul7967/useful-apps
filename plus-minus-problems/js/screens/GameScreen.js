/**
 * Игровой экран
 * Отвечает за отображение игрового процесса и управление игрой
 */
class GameScreen extends BaseScreen {
    constructor(app) {
        super(app, 'game');
        this.gameService = app.services.game;
        this.timerService = app.services.timer;
        this.storageService = app.services.storage;
        this.currentExample = null;
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        super.bindEvents();
        
        // Кнопка следующего примера
        this.addEventListener('nextExample', 'click', () => {
            this.nextExample();
        });

        // Кнопка перезапуска раунда
        this.addEventListener('restartRound', 'click', () => {
            this.restartRound();
        });

        // Кнопка новой игры
        this.addEventListener('newGame', 'click', () => {
            this.newGame();
        });

        // Обработка нажатия Enter в поле ввода
        this.addEventListener('answerInput', 'keypress', (e) => {
            if (e.key === 'Enter') {
                this.nextExample();
            }
        });

        // Подписка на обновления таймера
        this.timerService.subscribe((timerData) => {
            this.updateTimerDisplay(timerData.formatted);
        });

        console.log('🎮 [GameScreen] События привязаны');
    }

    /**
     * Обработчик показа экрана
     */
    onShow() {
        console.log('🎮 [GameScreen] Показываем игровой экран');
        this.startGame();
    }

    /**
     * Запуск игры
     */
    startGame() {
        console.log('🎮 [GameScreen] Запуск игры');
        
        // Получаем настройки из главного приложения
        const settings = this.app.getGameSettings();
        
        // Инициализируем игровой сервис
        this.gameService.initGame(settings);
        
        // Запускаем таймер
        this.timerService.start();
        
        // Показываем первый пример
        this.showCurrentExample();
        
        // Обновляем интерфейс
        this.updateGameInterface();
        
        console.log('🎮 [GameScreen] Игра запущена');
    }

    /**
     * Показ текущего примера
     */
    showCurrentExample() {
        this.currentExample = this.gameService.getCurrentExample();
        
        if (!this.currentExample) {
            console.log('🎮 [GameScreen] Игра завершена');
            this.endGame();
            return;
        }
        
        console.log(`📝 [GameScreen] Показываем пример: ${this.currentExample.text}`);
        
        // Обновляем отображение
        this.setText('exampleText', this.currentExample.text);
        this.setValue('answerInput', '');
        this.setText('currentExample', this.gameService.currentExample + 1);
        this.setText('totalExamples', this.gameService.totalExamples);
        this.setText('currentScore', this.gameService.score);
        
        // Устанавливаем фокус на поле ввода
        const answerInput = this.getElement('answerInput');
        if (answerInput) {
            answerInput.focus();
        }
    }

    /**
     * Переход к следующему примеру
     */
    nextExample() {
        console.log('➡️ [GameScreen] Обработка ответа пользователя');
        
        const userAnswer = this.getValue('answerInput');
        if (!userAnswer) {
            alert('Пожалуйста, введите ответ');
            return;
        }
        
        // Проверяем ответ
        const result = this.gameService.checkAnswer(userAnswer);
        
        if (!result.correct && result.message) {
            alert(result.message);
            return;
        }
        
        // Обновляем счет
        this.setText('currentScore', this.gameService.score);
        
        // Переходим к следующему примеру
        const nextExample = this.gameService.nextExample();
        
        if (this.gameService.isGameFinished()) {
            console.log('🎮 [GameScreen] Все примеры пройдены, завершаем игру');
            this.endGame();
        } else {
            console.log('➡️ [GameScreen] Показываем следующий пример');
            this.showCurrentExample();
        }
    }

    /**
     * Завершение игры
     */
    endGame() {
        console.log('🏁 [GameScreen] Завершение игры');
        
        // Останавливаем таймер
        this.timerService.stop();
        
        // Получаем результаты
        const gameResults = this.gameService.getGameResults();
        const gameTime = this.timerService.getElapsedTime();
        
        // Сохраняем результат
        const gameResult = {
            playerName: this.app.getPlayerName(),
            score: gameResults.score,
            totalExamples: gameResults.totalExamples,
            time: gameTime,
            operationType: this.app.getGameSettings().operationType,
            maxNumber: this.app.getGameSettings().maxNumber,
            percentage: gameResults.percentage,
            wrongExamples: gameResults.wrongExamples
        };
        
        this.storageService.saveGameResult(gameResult);
        
        // Переходим к экрану результатов
        this.app.showScreen('results', gameResult);
    }

    /**
     * Перезапуск раунда
     */
    restartRound() {
        console.log('🔄 [GameScreen] Перезапуск раунда');
        
        // Останавливаем таймер
        this.timerService.stop();
        
        // Перезапускаем игровой сервис
        this.gameService.restartGame();
        
        // Запускаем таймер заново
        this.timerService.start();
        
        // Показываем первый пример
        this.showCurrentExample();
        
        // Обновляем интерфейс
        this.updateGameInterface();
        
        console.log('🔄 [GameScreen] Раунд перезапущен');
    }

    /**
     * Новая игра
     */
    newGame() {
        console.log('🆕 [GameScreen] Новая игра');
        
        // Останавливаем таймер
        this.timerService.stop();
        
        // Сбрасываем игровой сервис
        this.gameService.resetGame();
        
        // Возвращаемся к настройкам
        this.app.showScreen('settings');
    }

    /**
     * Обновление игрового интерфейса
     */
    updateGameInterface() {
        this.setText('totalExamples', this.gameService.totalExamples);
        this.setText('currentScore', this.gameService.score);
    }

    /**
     * Обновление отображения таймера
     */
    updateTimerDisplay(timeString) {
        this.setText('gameTimer', timeString);
    }

    /**
     * Обработчик скрытия экрана
     */
    onHide() {
        console.log('🎮 [GameScreen] Скрываем игровой экран');
        
        // Останавливаем таймер
        this.timerService.stop();
        
        // Очищаем поле ввода
        this.setValue('answerInput', '');
    }

    /**
     * Получение текущего состояния игры
     */
    getGameState() {
        return {
            currentExample: this.gameService.currentExample,
            totalExamples: this.gameService.totalExamples,
            score: this.gameService.score,
            isFinished: this.gameService.isGameFinished(),
            timer: this.timerService.getFormattedTime()
        };
    }

    /**
     * Установка состояния игры (для восстановления)
     */
    setGameState(state) {
        if (state.currentExample !== undefined) {
            this.gameService.currentExample = state.currentExample;
        }
        if (state.score !== undefined) {
            this.gameService.score = state.score;
        }
        
        this.updateGameInterface();
        this.showCurrentExample();
    }
}
