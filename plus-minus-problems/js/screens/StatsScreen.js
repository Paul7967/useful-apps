/**
 * Экран статистики
 * Отображает статистику игрока и историю игр
 */
class StatsScreen extends BaseScreen {
    constructor(app) {
        super(app, 'stats');
        this.storageService = app.services.storage;
        this.statistics = null;
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        super.bindEvents();
        
        // Кнопка возврата к настройкам
        this.addEventListener('backToSettings', 'click', () => {
            this.backToSettings();
        });

        // Кнопка очистки статистики
        this.addEventListener('clearStats', 'click', () => {
            this.clearStatistics();
        });

        // Кнопка экспорта данных
        this.addEventListener('exportData', 'click', () => {
            this.exportData();
        });

        // Кнопка импорта данных
        this.addEventListener('importData', 'click', () => {
            this.importData();
        });

        console.log('📈 [StatsScreen] События привязаны');
    }

    /**
     * Обработчик показа экрана
     */
    onShow() {
        console.log('📈 [StatsScreen] Показываем статистику');
        this.loadStatistics();
        this.displayStatistics();
    }

    /**
     * Загрузка статистики
     */
    loadStatistics() {
        console.log('📈 [StatsScreen] Загрузка статистики');
        this.statistics = this.storageService.getPlayerStatistics();
        console.log('📈 [StatsScreen] Статистика загружена:', this.statistics);
    }

    /**
     * Отображение статистики
     */
    displayStatistics() {
        if (!this.statistics) {
            console.log('📈 [StatsScreen] Нет данных для отображения');
            this.displayEmptyStats();
            return;
        }

        console.log('📈 [StatsScreen] Отображение статистики');
        
        // Основная статистика
        this.setText('totalGames', this.statistics.totalGames);
        this.setText('bestScore', this.statistics.bestScore);
        this.setText('averageScore', this.statistics.averageScore);
        this.setText('perfectGames', this.statistics.perfectGames);
        this.setText('averageTime', this.formatTime(this.statistics.averageTime));
        
        // Последняя игра
        if (this.statistics.lastPlayed) {
            const lastPlayedDate = new Date(this.statistics.lastPlayed);
            this.setText('lastPlayed', lastPlayedDate.toLocaleDateString('ru-RU'));
        } else {
            this.setText('lastPlayed', 'Никогда');
        }
        
        // Отображение последних игр
        this.displayRecentGames();
        
        // Отображение прогресса
        this.displayProgress();
    }

    /**
     * Отображение пустой статистики
     */
    displayEmptyStats() {
        this.setText('totalGames', '0');
        this.setText('bestScore', '0');
        this.setText('averageScore', '0');
        this.setText('perfectGames', '0');
        this.setText('averageTime', '00:00');
        this.setText('lastPlayed', 'Никогда');
        
        const recentGamesList = this.getElement('recentGamesList');
        if (recentGamesList) {
            recentGamesList.innerHTML = '<li>История игр пуста</li>';
        }
    }

    /**
     * Отображение последних игр
     */
    displayRecentGames() {
        const recentGamesList = this.getElement('recentGamesList');
        if (!recentGamesList || !this.statistics.recentGames) return;
        
        recentGamesList.innerHTML = '';
        
        if (this.statistics.recentGames.length === 0) {
            recentGamesList.innerHTML = '<li>История игр пуста</li>';
            return;
        }
        
        this.statistics.recentGames.slice(-10).reverse().forEach(game => {
            const li = document.createElement('li');
            const gameDate = new Date(game.timestamp).toLocaleDateString('ru-RU');
            const gameTime = this.formatTime(game.time);
            const percentage = Math.round((game.score / game.totalExamples) * 100);
            
            li.innerHTML = `
                <div class="game-item">
                    <div class="game-date">${gameDate}</div>
                    <div class="game-score">${game.score}/${game.totalExamples} (${percentage}%)</div>
                    <div class="game-time">${gameTime}</div>
                    <div class="game-type">${this.getOperationTypeName(game.operationType)}</div>
                </div>
            `;
            
            li.style.cssText = `
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 10px;
                margin: 5px 0;
                display: flex;
                justify-content: space-between;
                align-items: center;
            `;
            
            recentGamesList.appendChild(li);
        });
    }

    /**
     * Отображение прогресса
     */
    displayProgress() {
        const progressContainer = this.getElement('progressContainer');
        if (!progressContainer || !this.statistics) return;
        
        const totalGames = this.statistics.totalGames;
        const perfectGames = this.statistics.perfectGames;
        const perfectPercentage = totalGames > 0 ? Math.round((perfectGames / totalGames) * 100) : 0;
        
        progressContainer.innerHTML = `
            <div class="progress-item">
                <div class="progress-label">Идеальных игр</div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${perfectPercentage}%"></div>
                </div>
                <div class="progress-text">${perfectGames}/${totalGames} (${perfectPercentage}%)</div>
            </div>
        `;
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
     * Получение названия типа операции
     */
    getOperationTypeName(operationType) {
        const names = {
            'addition': 'Сложение',
            'subtraction': 'Вычитание',
            'both': 'Смешанные'
        };
        return names[operationType] || operationType;
    }

    /**
     * Возврат к настройкам
     */
    backToSettings() {
        console.log('🔙 [StatsScreen] Возврат к настройкам');
        this.app.showScreen('settings');
    }

    /**
     * Очистка статистики
     */
    clearStatistics() {
        if (confirm('Вы уверены, что хотите удалить всю статистику? Это действие нельзя отменить.')) {
            this.storageService.clearAllData();
            alert('Статистика удалена');
            this.loadStatistics();
            this.displayStatistics();
            console.log('🗑️ [StatsScreen] Статистика очищена');
        }
    }

    /**
     * Экспорт данных
     */
    exportData() {
        const data = this.storageService.exportData();
        if (data) {
            const blob = new Blob([data], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `math-game-data-${new Date().toISOString().split('T')[0]}.json`;
            a.click();
            URL.revokeObjectURL(url);
            console.log('📤 [StatsScreen] Данные экспортированы');
        } else {
            alert('Ошибка экспорта данных');
        }
    }

    /**
     * Импорт данных
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        const success = this.storageService.importData(e.target.result);
                        if (success) {
                            alert('Данные успешно импортированы');
                            this.loadStatistics();
                            this.displayStatistics();
                        } else {
                            alert('Ошибка импорта данных');
                        }
                    } catch (error) {
                        alert('Ошибка чтения файла');
                        console.error('❌ [StatsScreen] Ошибка импорта:', error);
                    }
                };
                reader.readAsText(file);
            }
        };
        
        input.click();
    }

    /**
     * Получение детальной статистики
     */
    getDetailedStats() {
        const history = this.storageService.loadGameHistory();
        
        if (history.length === 0) {
            return null;
        }
        
        // Группировка по дням
        const dailyStats = {};
        history.forEach(game => {
            const date = new Date(game.timestamp).toDateString();
            if (!dailyStats[date]) {
                dailyStats[date] = { games: 0, totalScore: 0, totalTime: 0 };
            }
            dailyStats[date].games++;
            dailyStats[date].totalScore += game.score;
            dailyStats[date].totalTime += game.time;
        });
        
        // Статистика по типам операций
        const operationStats = {};
        history.forEach(game => {
            if (!operationStats[game.operationType]) {
                operationStats[game.operationType] = { games: 0, totalScore: 0 };
            }
            operationStats[game.operationType].games++;
            operationStats[game.operationType].totalScore += game.score;
        });
        
        return {
            dailyStats,
            operationStats,
            totalGames: history.length,
            averageScore: Math.round(history.reduce((sum, game) => sum + game.score, 0) / history.length),
            bestScore: Math.max(...history.map(game => game.score))
        };
    }
}
