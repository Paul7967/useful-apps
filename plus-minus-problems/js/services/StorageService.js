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
            statistics: 'mathGameStatistics',
            compositionRange: 'mathGameCompositionRange',
            compositionGames: 'mathGameCompositionGames',
            compositionSettings: 'mathGameCompositionSettings',
            currentScreen: 'mathGameCurrentScreen'
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
        const compositionHistory = this.loadCompositionGames();
        
        // Если имя игрока не передано, получаем текущее имя
        if (!playerName) {
            playerName = this.loadPlayerName();
        }
        
        // Фильтруем историю по имени игрока
        const playerHistory = history.filter(game => game.playerName === playerName);
        const playerCompositionHistory = compositionHistory.filter(game => game.playerName === playerName);
        
        // Объединяем все игры и сортируем по дате (новые сверху)
        const allGames = [...playerHistory, ...playerCompositionHistory]
            .sort((a, b) => {
                const dateA = new Date(a.date || a.timestamp);
                const dateB = new Date(b.date || b.timestamp);
                return dateB - dateA; // Новые игры сверху
            });
        
        if (allGames.length === 0) {
            return {
                totalGames: 0,
                bestScore: 0,
                averageScore: 0,
                totalTime: 0,
                averageTime: 0,
                perfectGames: 0,
                lastPlayed: null,
                playerName: playerName,
                compositionGames: 0,
                regularGames: 0
            };
        }

        const totalGames = allGames.length;
        const regularGames = playerHistory.length;
        const compositionGames = playerCompositionHistory.length;
        
        // Для обычных игр используем score, для игр "Состав числа" - correctAnswers
        const scores = allGames.map(game => {
            if (game.type === 'composition') {
                return game.correctAnswers || 0;
            }
            return game.score || 0;
        });
        
        const times = allGames.map(game => {
            if (game.type === 'composition') {
                return game.gameTime || 0;
            }
            return game.time || 0;
        });
        
        const bestScore = Math.max(...scores);
        const averageScore = Math.round(scores.reduce((a, b) => a + b, 0) / totalGames);
        const totalTime = times.reduce((a, b) => a + b, 0);
        const averageTime = Math.round(totalTime / totalGames);
        
        // Для perfectGames считаем игры с максимальным счетом
        const maxPossibleScore = Math.max(...scores);
        const perfectGames = scores.filter(score => score === maxPossibleScore).length;
        
        const lastPlayed = allGames[allGames.length - 1].date || allGames[allGames.length - 1].timestamp;

        const statistics = {
            totalGames,
            bestScore,
            averageScore,
            totalTime,
            averageTime,
            perfectGames,
            lastPlayed,
            playerName: playerName,
            recentGames: allGames, // Все игры текущего игрока
            compositionGames: compositionGames,
            regularGames: regularGames
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
     * Получение списка всех игроков из истории
     */
    getAllPlayers() {
        try {
            const history = this.loadGameHistory();
            const players = [...new Set(history.map(game => game.playerName))].filter(name => name && name.trim());
            
            // Добавляем текущего игрока из localStorage, если его нет в списке
            const currentPlayer = this.loadPlayerName();
            if (currentPlayer && currentPlayer.trim() && !players.includes(currentPlayer)) {
                players.push(currentPlayer);
                console.log('👥 [StorageService] Добавлен текущий игрок:', currentPlayer);
            }
            
            players.sort();
            console.log('👥 [StorageService] Найдено игроков:', players.length);
            console.log('👥 [StorageService] Список игроков:', players);
            return players;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка получения списка игроков:', error);
            return [];
        }
    }

    /**
     * Сохранение диапазона для игры "Состав числа"
     */
    saveCompositionRange(range) {
        try {
            localStorage.setItem(this.keys.compositionRange, range);
            console.log('💾 [StorageService] Диапазон для Состав числа сохранен:', range);
        } catch (error) {
            console.error('❌ [StorageService] Ошибка при сохранении диапазона:', error);
        }
    }

    /**
     * Загрузка диапазона для игры "Состав числа"
     */
    loadCompositionRange() {
        try {
            const range = localStorage.getItem(this.keys.compositionRange);
            console.log('📖 [StorageService] Диапазон для Состав числа загружен:', range);
            return range;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка при загрузке диапазона:', error);
            return null;
        }
    }

    /**
     * Сохранение настроек игры "Состав числа"
     */
    saveCompositionSettings(settings) {
        try {
            localStorage.setItem(this.keys.compositionSettings, JSON.stringify(settings));
            console.log('💾 [StorageService] Настройки Состав числа сохранены:', settings);
            
            // Проверяем, что данные действительно сохранились
            setTimeout(() => {
                const saved = localStorage.getItem(this.keys.compositionSettings);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    console.log('💾 [StorageService] Проверка сохранения через задержку:', parsed);
                } else {
                    console.error('❌ [StorageService] Данные не сохранились!');
                }
            }, 10);
        } catch (error) {
            console.error('❌ [StorageService] Ошибка при сохранении настроек:', error);
        }
    }

    /**
     * Загрузка настроек игры "Состав числа"
     */
    loadCompositionSettings() {
        try {
            const settings = localStorage.getItem(this.keys.compositionSettings);
            console.log('📖 [StorageService] Сырые данные из localStorage:', settings);
            
            if (settings) {
                const parsedSettings = JSON.parse(settings);
                console.log('📖 [StorageService] Настройки Состав числа загружены:', parsedSettings);
                
                // Проверяем, что все необходимые поля присутствуют
                if (parsedSettings.minNumber && parsedSettings.maxNumber && parsedSettings.repetitions) {
                    console.log('📖 [StorageService] Все поля присутствуют:', {
                        minNumber: parsedSettings.minNumber,
                        maxNumber: parsedSettings.maxNumber,
                        repetitions: parsedSettings.repetitions
                    });
                    return parsedSettings;
                } else {
                    console.log('📖 [StorageService] Не все поля присутствуют в сохраненных настройках');
                    return null;
                }
            } else {
                console.log('📖 [StorageService] Нет сохраненных настроек');
            }
        } catch (error) {
            console.error('❌ [StorageService] Ошибка при загрузке настроек:', error);
        }
        return null;
    }

    /**
     * Сохранение результата игры "Состав числа"
     */
    saveCompositionGame(gameData) {
        try {
            const existingGames = this.loadCompositionGames();
            existingGames.push(gameData);
            localStorage.setItem(this.keys.compositionGames, JSON.stringify(existingGames));
            console.log('💾 [StorageService] Результат игры Состав числа сохранен');
        } catch (error) {
            console.error('❌ [StorageService] Ошибка при сохранении результата игры:', error);
        }
    }

    /**
     * Загрузка истории игр "Состав числа"
     */
    loadCompositionGames() {
        try {
            const games = localStorage.getItem(this.keys.compositionGames);
            return games ? JSON.parse(games) : [];
        } catch (error) {
            console.error('❌ [StorageService] Ошибка при загрузке истории игр:', error);
            return [];
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

    /**
     * Удаление игры по ID
     */
    deleteGameById(gameId) {
        try {
            let deleted = false;
            
            // Пробуем удалить из обычных игр
            const history = this.loadGameHistory();
            const initialHistoryLength = history.length;
            const filteredHistory = history.filter(game => game.id !== gameId);
            
            if (filteredHistory.length < initialHistoryLength) {
                localStorage.setItem(this.keys.gameHistory, JSON.stringify(filteredHistory));
                console.log('🗑️ [StorageService] Обычная игра с ID', gameId, 'удалена');
                deleted = true;
            }
            
            // Пробуем удалить из игр "Состав числа"
            const compositionHistory = this.loadCompositionGames();
            const initialCompositionLength = compositionHistory.length;
            const filteredCompositionHistory = compositionHistory.filter(game => game.id !== gameId);
            
            if (filteredCompositionHistory.length < initialCompositionLength) {
                localStorage.setItem(this.keys.compositionGames, JSON.stringify(filteredCompositionHistory));
                console.log('🗑️ [StorageService] Игра "Состав числа" с ID', gameId, 'удалена');
                deleted = true;
            }
            
            if (!deleted) {
                console.log('⚠️ [StorageService] Игра с ID', gameId, 'не найдена ни в обычных играх, ни в играх "Состав числа"');
                return false;
            }
            
            console.log('✅ [StorageService] Игра успешно удалена');
            return true;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка удаления игры:', error);
            return false;
        }
    }

    /**
     * Сохранение текущего экрана
     */
    saveCurrentScreen(screenId) {
        try {
            localStorage.setItem(this.keys.currentScreen, screenId);
            console.log('💾 [StorageService] Текущий экран сохранен:', screenId);
        } catch (error) {
            console.error('❌ [StorageService] Ошибка сохранения текущего экрана:', error);
        }
    }

    /**
     * Загрузка текущего экрана
     */
    loadCurrentScreen() {
        try {
            const screenId = localStorage.getItem(this.keys.currentScreen);
            console.log('📖 [StorageService] Текущий экран загружен:', screenId);
            return screenId;
        } catch (error) {
            console.error('❌ [StorageService] Ошибка загрузки текущего экрана:', error);
            return null;
        }
    }
}
