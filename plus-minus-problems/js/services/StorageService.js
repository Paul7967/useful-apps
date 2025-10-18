/**
 * Сервис для работы с локальным хранилищем
 * Отвечает за сохранение и загрузку настроек, статистики и данных игрока
 */
class StorageService {
    constructor() {
        this.keys = {
            playerName: 'mathGamePlayerName',
            settings: 'mathGameSettings',
            gameHistory: 'mathGameHistory',
            statistics: 'mathGameStatistics'
        };
    }

    /**
     * Сохранение имени игрока
     */
    savePlayerName(name) {
        if (name && name.trim()) {
            localStorage.setItem(this.keys.playerName, name.trim());
            console.log('💾 [StorageService] Имя игрока сохранено:', name.trim());
            return true;
        }
        return false;
    }

    /**
     * Загрузка имени игрока
     */
    loadPlayerName() {
        const name = localStorage.getItem(this.keys.playerName);
        console.log('📥 [StorageService] Имя игрока загружено:', name || 'не установлено');
        return name || '';
    }

    /**
     * Сохранение настроек игры
     */
    saveGameSettings(settings) {
        try {
            const settingsData = {
                maxNumber: settings.maxNumber || 10,
                examplesCount: settings.examplesCount || 5,
                operationType: settings.operationType || 'addition',
                timestamp: Date.now()
            };
            
            localStorage.setItem(this.keys.settings, JSON.stringify(settingsData));
            console.log('💾 [StorageService] Настройки игры сохранены:', settingsData);
            return true;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка сохранения настроек:', error);
            return false;
        }
    }

    /**
     * Загрузка настроек игры
     */
    loadGameSettings() {
        try {
            const saved = localStorage.getItem(this.keys.settings);
            if (saved) {
                const settings = JSON.parse(saved);
                console.log('📥 [StorageService] Настройки игры загружены:', settings);
                return settings;
            }
        } catch (error) {
            console.error('❌ [StorageService] Ошибка загрузки настроек:', error);
        }
        
        // Возвращаем настройки по умолчанию
        const defaultSettings = {
            maxNumber: 10,
            examplesCount: 5,
            operationType: 'addition'
        };
        console.log('📥 [StorageService] Используются настройки по умолчанию:', defaultSettings);
        return defaultSettings;
    }

    /**
     * Сохранение результата игры
     */
    saveGameResult(gameResult) {
        try {
            const history = this.loadGameHistory();
            
            const result = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                playerName: gameResult.playerName || 'Игрок',
                score: gameResult.score,
                totalExamples: gameResult.totalExamples,
                time: gameResult.time,
                operationType: gameResult.operationType,
                maxNumber: gameResult.maxNumber,
                percentage: gameResult.percentage,
                wrongExamples: gameResult.wrongExamples || []
            };
            
            history.push(result);
            
            // Ограничиваем историю последними 100 играми
            if (history.length > 100) {
                history.splice(0, history.length - 100);
            }
            
            localStorage.setItem(this.keys.gameHistory, JSON.stringify(history));
            console.log('💾 [StorageService] Результат игры сохранен:', result);
            return true;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка сохранения результата игры:', error);
            return false;
        }
    }

    /**
     * Загрузка истории игр
     */
    loadGameHistory() {
        try {
            const saved = localStorage.getItem(this.keys.gameHistory);
            if (saved) {
                const history = JSON.parse(saved);
                console.log('📥 [StorageService] История игр загружена:', history.length, 'игр');
                return history;
            }
        } catch (error) {
            console.error('❌ [StorageService] Ошибка загрузки истории игр:', error);
        }
        
        console.log('📥 [StorageService] История игр пуста');
        return [];
    }

    /**
     * Получение статистики игрока
     */
    getPlayerStatistics(playerName = null) {
        const history = this.loadGameHistory();
        
        // Если имя игрока не передано, получаем текущее имя
        if (!playerName) {
            playerName = this.loadPlayerName();
        }
        
        // Фильтруем историю по имени игрока
        const playerHistory = history.filter(game => game.playerName === playerName);
        
        if (playerHistory.length === 0) {
            return {
                totalGames: 0,
                bestScore: 0,
                averageScore: 0,
                totalTime: 0,
                averageTime: 0,
                perfectGames: 0,
                lastPlayed: null,
                playerName: playerName
            };
        }

        const totalGames = playerHistory.length;
        const scores = playerHistory.map(game => game.score);
        const times = playerHistory.map(game => game.time);
        
        const bestScore = Math.max(...scores);
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalGames);
        const totalTime = times.reduce((a, b) => a + b, 0);
        const averageTime = Math.round(totalTime / totalGames);
        const perfectGames = scores.filter(score => score === playerHistory[0].totalExamples).length;
        const lastPlayed = playerHistory[playerHistory.length - 1].timestamp;

        const statistics = {
            totalGames,
            bestScore,
            averageScore,
            totalTime,
            averageTime,
            perfectGames,
            lastPlayed,
            playerName: playerName,
            recentGames: playerHistory.slice(-10) // Последние 10 игр текущего игрока
        };

        console.log('📊 [StorageService] Статистика игрока', playerName, ':', statistics);
        return statistics;
    }

    /**
     * Очистка истории игр
     */
    clearGameHistory() {
        try {
            localStorage.removeItem(this.keys.gameHistory);
            console.log('🗑️ [StorageService] История игр очищена');
            return true;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка очистки истории игр:', error);
            return false;
        }
    }

    /**
     * Очистка статистики конкретного игрока
     */
    clearPlayerStatistics(playerName = null) {
        try {
            if (!playerName) {
                playerName = this.loadPlayerName();
            }
            
            const history = this.loadGameHistory();
            const filteredHistory = history.filter(game => game.playerName !== playerName);
            
            localStorage.setItem(this.keys.gameHistory, JSON.stringify(filteredHistory));
            console.log('🗑️ [StorageService] Статистика игрока', playerName, 'очищена');
            return true;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка очистки статистики игрока:', error);
            return false;
        }
    }

    /**
     * Очистка всех данных
     */
    clearAllData() {
        try {
            Object.values(this.keys).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('🗑️ [StorageService] Все данные очищены');
            return true;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка очистки всех данных:', error);
            return false;
        }
    }

    /**
     * Экспорт данных
     */
    exportData() {
        try {
            const currentPlayer = this.loadPlayerName();
            const playerHistory = this.loadGameHistory().filter(game => game.playerName === currentPlayer);
            
            const data = {
                playerName: currentPlayer,
                settings: this.loadGameSettings(),
                gameHistory: playerHistory,
                statistics: this.getPlayerStatistics(currentPlayer),
                exportDate: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(data, null, 2);
            console.log('📤 [StorageService] Данные игрока', currentPlayer, 'экспортированы');
            return dataStr;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка экспорта данных:', error);
            return null;
        }
    }

    /**
     * Импорт данных
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            
            if (data.playerName) {
                this.savePlayerName(data.playerName);
            }
            
            if (data.settings) {
                this.saveGameSettings(data.settings);
            }
            
            if (data.gameHistory) {
                localStorage.setItem(this.keys.gameHistory, JSON.stringify(data.gameHistory));
            }
            
            console.log('📥 [StorageService] Данные импортированы');
            return true;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка импорта данных:', error);
            return false;
        }
    }
}
