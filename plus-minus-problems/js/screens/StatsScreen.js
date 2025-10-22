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
        const currentPlayer = this.storageService.loadPlayerName();
        this.statistics = this.storageService.getPlayerStatistics(currentPlayer);
        console.log('📈 [StatsScreen] Статистика загружена для игрока', currentPlayer, ':', this.statistics);
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
        
        // Обновляем заголовок с именем игрока
        const playerName = this.statistics.playerName || 'Игрок';
        const headerElement = this.element.querySelector('h2');
        if (headerElement) {
            headerElement.textContent = `Статистика игрока: ${playerName}`;
        }
        
        // Основная статистика
        this.setText('totalGames', this.statistics.totalGames);
        this.setText('bestScore', this.statistics.bestScore);
        this.setText('averageScore', this.statistics.averageScore);
        this.setText('perfectGames', this.statistics.perfectGames);
        this.setText('averageTime', this.formatTime(this.statistics.averageTime));
        
        // Статистика по типам игр
        if (this.statistics.compositionGames !== undefined) {
            this.setText('compositionGames', this.statistics.compositionGames);
        }
        if (this.statistics.regularGames !== undefined) {
            this.setText('regularGames', this.statistics.regularGames);
        }
        
        // Последняя игра
        if (this.statistics.lastPlayed) {
            const lastPlayedDate = new Date(this.statistics.lastPlayed);
            this.setText('lastPlayed', lastPlayedDate.toLocaleDateString('ru-RU'));
        } else {
            this.setText('lastPlayed', 'Никогда');
        }
        
        // Отображение статистики по дням
        this.displayDailyStats();
        
        // Отображение последних игр
        this.displayRecentGames();
        
        // Отображение прогресса
        this.displayProgress();
    }

    /**
     * Отображение пустой статистики
     */
    displayEmptyStats() {
        const currentPlayer = this.storageService.loadPlayerName();
        const playerName = currentPlayer || 'Игрок';
        
        // Обновляем заголовок с именем игрока
        const headerElement = this.element.querySelector('h2');
        if (headerElement) {
            headerElement.textContent = `Статистика игрока: ${playerName}`;
        }
        
        this.setText('totalGames', '0');
        this.setText('bestScore', '0');
        this.setText('averageScore', '0');
        this.setText('perfectGames', '0');
        this.setText('averageTime', '00:00');
        this.setText('lastPlayed', 'Никогда');
        
        const recentGamesList = this.getElement('recentGamesList');
        if (recentGamesList) {
            recentGamesList.innerHTML = `<li>У игрока "${playerName}" пока нет игр</li>`;
        }
    }

    /**
     * Отображение статистики по дням
     */
    displayDailyStats() {
        const dailyStatsList = this.getElement('dailyStatsList');
        if (!dailyStatsList || !this.statistics.recentGames) return;
        
        dailyStatsList.innerHTML = '';
        
        if (this.statistics.recentGames.length === 0) {
            dailyStatsList.innerHTML = '<div class="no-data">Нет данных для отображения</div>';
            return;
        }
        
        // Группируем игры по датам
        const gamesByDate = {};
        this.statistics.recentGames.forEach(game => {
            const date = new Date(game.timestamp).toLocaleDateString('ru-RU');
            if (!gamesByDate[date]) {
                gamesByDate[date] = {
                    games: [],
                    totalExamples: 0,
                    totalScore: 0,
                    totalTime: 0
                };
            }
            gamesByDate[date].games.push(game);
            gamesByDate[date].totalExamples += game.totalExamples;
            gamesByDate[date].totalScore += game.score;
            gamesByDate[date].totalTime += game.time;
        });
        
        // Сортируем даты по убыванию (новые сначала)
        const sortedDates = Object.keys(gamesByDate).sort((a, b) => {
            return new Date(b.split('.').reverse().join('-')) - new Date(a.split('.').reverse().join('-'));
        });
        
        // Отображаем статистику по дням
        sortedDates.forEach(date => {
            const dayData = gamesByDate[date];
            const dayContainer = document.createElement('div');
            dayContainer.className = 'daily-stat-item';
            
            const percentage = Math.round((dayData.totalScore / dayData.totalExamples) * 100);
            const avgTime = Math.round(dayData.totalTime / dayData.games.length);
            
            dayContainer.innerHTML = `
                <div class="daily-stat-header">
                    <div class="daily-date">${date}</div>
                    <div class="daily-games-count">${dayData.games.length} игр</div>
                </div>
                <div class="daily-stat-details">
                    <div class="daily-total-examples">Всего примеров: ${dayData.totalExamples}</div>
                    <div class="daily-correct-answers">Правильных: ${dayData.totalScore} (${percentage}%)</div>
                    <div class="daily-avg-time">Среднее время: ${this.formatTime(avgTime)}</div>
                </div>
            `;
            
            dayContainer.style.cssText = `
                border: 1px solid #ddd;
                border-radius: 8px;
                padding: 15px;
                margin: 10px 0;
                background: rgba(255, 255, 255, 0.1);
            `;
            
            dailyStatsList.appendChild(dayContainer);
        });
    }

    /**
     * Создание таблицы истории игр
     */
    createGamesTable() {
        const recentGamesSection = document.querySelector('.recent-games');
        if (!recentGamesSection) return;
        
        // Удаляем существующую таблицу, если есть
        const existingTable = recentGamesSection.querySelector('table');
        if (existingTable) {
            existingTable.remove();
        }
        
        // Создаем новую таблицу
        const table = document.createElement('table');
        table.className = 'games-table';
        
        // Создаем заголовок таблицы
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Дата</th>
                <th>Результат</th>
                <th>Время</th>
                <th>Тип</th>
                <th>Макс. число</th>
                <th>Действие</th>
            </tr>
        `;
        
        // Создаем тело таблицы
        const tbody = document.createElement('tbody');
        tbody.id = 'gamesTableBody';
        
        table.appendChild(thead);
        table.appendChild(tbody);
        
        // Заменяем ul на table
        const ul = recentGamesSection.querySelector('ul');
        if (ul) {
            recentGamesSection.replaceChild(table, ul);
        } else {
            recentGamesSection.appendChild(table);
        }
    }

    /**
     * Отображение последних игр
     */
    displayRecentGames() {
        if (!this.statistics.recentGames) return;
        
        // Создаем таблицу
        this.createGamesTable();
        
        const tbody = document.getElementById('gamesTableBody');
        if (!tbody) return;
        
        tbody.innerHTML = '';
        
        if (this.statistics.recentGames.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = '<td colspan="6" class="no-games">История игр пуста</td>';
            tbody.appendChild(tr);
            return;
        }
        
        // Сортируем игры по дате (новые сверху) и переворачиваем для отображения
        const sortedGames = this.statistics.recentGames
            .slice()
            .sort((a, b) => {
                const dateA = new Date(a.date || a.timestamp);
                const dateB = new Date(b.date || b.timestamp);
                return dateB - dateA; // Новые игры сверху
            });
        
        console.log('📅 [StatsScreen] Отсортированные игры:', sortedGames.map(game => ({
            id: game.id,
            type: game.type || 'regular',
            date: game.date || game.timestamp
        })));
        
        sortedGames.forEach(game => {
            const tr = document.createElement('tr');
            const gameDate = new Date(game.date || game.timestamp).toLocaleDateString('ru-RU');
            
            let gameTime, result, gameType, maxNumber;
            
            if (game.type === 'composition') {
                // Игра "Состав числа"
                gameTime = this.formatTime(game.gameTime);
                const totalAnswers = game.correctAnswers + game.incorrectAnswers;
                const percentage = totalAnswers > 0 ? Math.round((game.correctAnswers / totalAnswers) * 100) : 0;
                result = `${game.correctAnswers}/${totalAnswers} (${percentage}%)`;
                gameType = 'Состав числа';
                maxNumber = game.range || (game.minNumber && game.maxNumber ? `${game.minNumber}-${game.maxNumber}` : 'Диапазон');
            } else {
                // Обычная игра
                gameTime = this.formatTime(game.time);
                const percentage = Math.round((game.score / game.totalExamples) * 100);
                result = `${game.score}/${game.totalExamples} (${percentage}%)`;
                gameType = this.getOperationTypeName(game.operationType);
                maxNumber = `До ${game.maxNumber}`;
            }
            
            tr.innerHTML = `
                <td>${gameDate}</td>
                <td>${result}</td>
                <td>${gameTime}</td>
                <td>${gameType}</td>
                <td>${maxNumber}</td>
                <td><button class="delete-game-btn" data-game-id="${game.id}" title="Удалить игру">×</button></td>
            `;
            
            tbody.appendChild(tr);
        });
        
        // Добавляем обработчики для кнопок удаления
        this.addDeleteGameListeners();
    }

    /**
     * Добавление обработчиков для кнопок удаления игр
     */
    addDeleteGameListeners() {
        const deleteButtons = document.querySelectorAll('.delete-game-btn');
        console.log('🔗 [StatsScreen] Найдено кнопок удаления:', deleteButtons.length);
        
        deleteButtons.forEach(button => {
            // Удаляем старые обработчики, если есть
            button.removeEventListener('click', this.handleDeleteClick);
            
            // Добавляем новый обработчик
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const gameId = parseInt(button.getAttribute('data-game-id'));
                console.log('🗑️ [StatsScreen] Нажата кнопка удаления для игры ID:', gameId);
                this.deleteGame(gameId);
            });
        });
    }

    /**
     * Удаление игры из истории
     */
    deleteGame(gameId) {
        if (confirm('Вы уверены, что хотите удалить эту игру из истории?')) {
            console.log('🗑️ [StatsScreen] Удаление игры с ID:', gameId);
            
            // Удаляем игру из localStorage
            const success = this.storageService.deleteGameById(gameId);
            
            if (success) {
                // Перезагружаем статистику
                console.log('🔄 [StatsScreen] Перезагружаем статистику после удаления');
                this.loadStatistics();
                this.displayStatistics();
                console.log('✅ [StatsScreen] Игра успешно удалена и статистика обновлена');
            } else {
                console.error('❌ [StatsScreen] Ошибка при удалении игры');
                alert('Ошибка при удалении игры. Игра не найдена или уже удалена.');
            }
        }
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
            'both': 'Сложение и вычитание'
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
        const currentPlayer = this.storageService.loadPlayerName();
        if (confirm(`Вы уверены, что хотите удалить статистику игрока "${currentPlayer}"? Это действие нельзя отменить.`)) {
            this.storageService.clearPlayerStatistics(currentPlayer);
            alert(`Статистика игрока "${currentPlayer}" удалена`);
            this.loadStatistics();
            this.displayStatistics();
            console.log('🗑️ [StatsScreen] Статистика игрока', currentPlayer, 'очищена');
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
