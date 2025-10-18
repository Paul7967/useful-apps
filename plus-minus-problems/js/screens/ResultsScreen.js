/**
 * Экран результатов игры
 * Отображает результаты завершенной игры и статистику
 */
class ResultsScreen extends BaseScreen {
    constructor(app) {
        super(app, 'results');
        this.storageService = app.services.storage;
        this.gameResult = null;
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        super.bindEvents();
        
        // Кнопка "Играть снова"
        this.addEventListener('playAgain', 'click', () => {
            this.playAgain();
        });

        // Кнопка "Новая игра"
        this.addEventListener('newGame', 'click', () => {
            this.newGame();
        });

        // Кнопка "Показать статистику"
        this.addEventListener('showStats', 'click', () => {
            this.showStatistics();
        });

        console.log('📊 [ResultsScreen] События привязаны');
    }

    /**
     * Обработчик показа экрана
     */
    onShow(gameResult = null) {
        console.log('📊 [ResultsScreen] Показываем результаты');
        
        if (gameResult) {
            this.gameResult = gameResult;
            this.displayResults(gameResult);
        } else {
            // Если результат не передан, загружаем последний
            this.loadLastResult();
        }
    }

    /**
     * Отображение результатов игры
     */
    displayResults(gameResult) {
        console.log('📊 [ResultsScreen] Отображение результатов:', gameResult);
        
        // Основные результаты
        this.setText('finalScore', gameResult.score);
        this.setText('totalExamplesResult', gameResult.totalExamples);
        this.setText('finalTime', this.formatTime(gameResult.time));
        
        // Процент правильных ответов
        const percentage = Math.round((gameResult.score / gameResult.totalExamples) * 100);
        this.setText('percentage', `${percentage}%`);
        
        // Отображение неправильных примеров
        this.displayWrongExamples(gameResult.wrongExamples || []);
        
        // Специальные сообщения
        this.displaySpecialMessages(gameResult);
    }

    /**
     * Отображение неправильных примеров
     */
    displayWrongExamples(wrongExamples) {
        const wrongExamplesList = this.getElement('wrongExamplesList');
        if (!wrongExamplesList) return;
        
        wrongExamplesList.innerHTML = '';
        
        if (wrongExamples.length === 0) {
            // Все примеры решены правильно
            this.setText('wrongExamplesTitle', 'Отлично!');
            
            const li = document.createElement('li');
            li.textContent = 'Все примеры решены правильно! 🎉';
            li.style.background = '#e8f5e8';
            li.style.borderColor = '#4CAF50';
            li.style.color = '#2e7d32';
            li.style.padding = '15px';
            li.style.borderRadius = '8px';
            li.style.margin = '10px 0';
            li.style.border = '2px solid';
            wrongExamplesList.appendChild(li);
        } else {
            // Показываем неправильные примеры
            this.setText('wrongExamplesTitle', 'Неправильно решенные примеры:');
            
            wrongExamples.forEach(wrongExample => {
                const li = document.createElement('li');
                li.textContent = `${wrongExample.example.text} Правильный ответ: ${wrongExample.example.correctAnswer}, Ваш ответ: ${wrongExample.userAnswer}`;
                li.style.background = '#ffebee';
                li.style.borderColor = '#f44336';
                li.style.color = '#d32f2f';
                li.style.padding = '15px';
                li.style.borderRadius = '8px';
                li.style.margin = '10px 0';
                li.style.border = '2px solid';
                wrongExamplesList.appendChild(li);
            });
        }
    }

    /**
     * Отображение специальных сообщений
     */
    displaySpecialMessages(gameResult) {
        const percentage = Math.round((gameResult.score / gameResult.totalExamples) * 100);
        
        // Создаем или находим контейнер для сообщений
        let messageContainer = this.getElement('specialMessage');
        if (!messageContainer) {
            messageContainer = document.createElement('div');
            messageContainer.id = 'specialMessage';
            messageContainer.style.cssText = `
                margin: 20px 0;
                padding: 15px;
                border-radius: 10px;
                text-align: center;
                font-size: 1.2em;
                font-weight: bold;
            `;
            
            // Вставляем перед кнопками
            const buttonsContainer = this.getElement('results-buttons');
            if (buttonsContainer) {
                buttonsContainer.parentNode.insertBefore(messageContainer, buttonsContainer);
            }
        }
        
        if (percentage === 100) {
            messageContainer.textContent = '🎉 ИДЕАЛЬНЫЙ РЕЗУЛЬТАТ! 🎉';
            messageContainer.style.background = 'linear-gradient(45deg, #4CAF50, #45a049)';
            messageContainer.style.color = 'white';
        } else if (percentage >= 80) {
            messageContainer.textContent = '👏 ОТЛИЧНАЯ РАБОТА! 👏';
            messageContainer.style.background = 'linear-gradient(45deg, #2196F3, #1976D2)';
            messageContainer.style.color = 'white';
        } else if (percentage >= 60) {
            messageContainer.textContent = '👍 ХОРОШО! 👍';
            messageContainer.style.background = 'linear-gradient(45deg, #FF9800, #F57C00)';
            messageContainer.style.color = 'white';
        } else {
            messageContainer.textContent = '💪 ПРОДОЛЖАЙТЕ ТРЕНИРОВАТЬСЯ! 💪';
            messageContainer.style.background = 'linear-gradient(45deg, #9C27B0, #7B1FA2)';
            messageContainer.style.color = 'white';
        }
    }

    /**
     * Форматирование времени
     */
    formatTime(milliseconds) {
        const minutes = Math.floor(milliseconds / 60000);
        const seconds = Math.floor((milliseconds % 60000) / 1000);
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Загрузка последнего результата
     */
    loadLastResult() {
        console.log('📊 [ResultsScreen] Загрузка последнего результата');
        const history = this.storageService.loadGameHistory();
        
        if (history.length > 0) {
            const lastResult = history[history.length - 1];
            this.displayResults(lastResult);
        } else {
            console.log('📊 [ResultsScreen] История игр пуста');
        }
    }

    /**
     * Играть снова
     */
    playAgain() {
        console.log('🔄 [ResultsScreen] Играть снова');
        this.app.showScreen('settings');
    }

    /**
     * Новая игра
     */
    newGame() {
        console.log('🆕 [ResultsScreen] Новая игра');
        this.app.showScreen('settings');
    }

    /**
     * Показать статистику
     */
    showStatistics() {
        console.log('📈 [ResultsScreen] Показать статистику');
        this.app.showScreen('stats');
    }

    /**
     * Получение статистики игрока
     */
    getPlayerStatistics() {
        return this.storageService.getPlayerStatistics();
    }

    /**
     * Экспорт результатов
     */
    exportResults() {
        if (!this.gameResult) {
            alert('Нет данных для экспорта');
            return;
        }
        
        const data = this.storageService.exportData();
        if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `math-game-results-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            console.log('📤 [ResultsScreen] Результаты экспортированы');
        }
    }

    /**
     * Очистка истории
     */
    clearHistory() {
        if (confirm('Вы уверены, что хотите удалить всю историю игр?')) {
            this.storageService.clearGameHistory();
            alert('История игр удалена');
            console.log('🗑️ [ResultsScreen] История игр очищена');
        }
    }
}
