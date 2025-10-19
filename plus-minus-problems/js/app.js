/**
 * Главный контроллер приложения
 * Управляет всеми экранами и сервисами
 */
class MathApp {
    constructor() {
        console.log('🚀 [MathApp] Инициализация приложения');
        
        // Инициализация сервисов
        this.services = {
            game: new GameService(),
            storage: new StorageService(),
            timer: new TimerService()
        };
        
        // Инициализация экранов
        this.screens = {
            settings: new SettingsScreen(this),
            game: new GameScreen(this),
            results: new ResultsScreen(this),
            stats: new StatsScreen(this)
        };
        
        // Текущий экран
        this.currentScreen = null;
        
        // Настройки игры
        this.gameSettings = null;
        
        // Инициализация приложения
        this.init();
    }

    /**
     * Инициализация приложения
     */
    init() {
        console.log('🚀 [MathApp] Инициализация компонентов');
        
        // Инициализация всех экранов
        Object.values(this.screens).forEach(screen => {
            screen.init();
        });
        
        // Инициализация навигации
        this.initNavigation();
        
        // Загрузка настроек
        this.loadSettings();
        
        // Загрузка имени игрока в Header
        this.loadPlayerNameInHeader();
        
        // Показ начального экрана (только при первой загрузке)
        if (!this.currentScreen) {
            this.showScreen('settings');
        }
        
        console.log('✅ [MathApp] Приложение инициализировано');
    }

    /**
     * Инициализация навигации
     */
    initNavigation() {
        console.log('🧭 [MathApp] Инициализация навигации');
        
        // Привязка событий к кнопкам навигации
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const screenName = e.currentTarget.dataset.screen;
                if (screenName && this.screens[screenName]) {
                    this.showScreen(screenName);
                }
            });
        });
        
        // Обработчик для кнопки "Новая игра"
        const newGameBtn = document.getElementById('newGame');
        if (newGameBtn) {
            newGameBtn.addEventListener('click', () => {
                this.startNewGame();
            });
        }
        
        console.log('✅ [MathApp] Навигация инициализирована');
    }

    /**
     * Показать экран
     */
    showScreen(screenName, data = null) {
        console.log(`🔄 [MathApp] Переключение на экран: ${screenName}`);
        
        // Скрываем текущий экран
        if (this.currentScreen && this.screens[this.currentScreen]) {
            this.screens[this.currentScreen].hide();
        }
        
        // Показываем новый экран
        if (this.screens[screenName]) {
            this.screens[screenName].show(data);
            this.currentScreen = screenName;
            
            // Обновляем активную кнопку навигации
            this.updateNavigation(screenName);
            
            console.log(`✅ [MathApp] Переключение на экран ${screenName} завершено`);
        } else {
            console.error(`❌ [MathApp] Экран ${screenName} не найден`);
        }
    }

    /**
     * Обновление навигации
     */
    updateNavigation(activeScreen) {
        // Убираем активный класс со всех кнопок
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        // Добавляем активный класс к текущей кнопке
        const activeBtn = document.querySelector(`[data-screen="${activeScreen}"]`);
        if (activeBtn) {
            activeBtn.classList.add('active');
        }
        
        console.log(`🧭 [MathApp] Навигация обновлена для экрана: ${activeScreen}`);
    }

    /**
     * Запуск игры
     */
    startGame() {
        console.log('🎮 [MathApp] Запуск игры');
        
        // Если настройки уже загружены, используем их
        if (!this.gameSettings) {
            // Получаем настройки из экрана настроек
            this.gameSettings = this.screens.settings.getCurrentSettings();
        }
        console.log('🎮 [MathApp] Настройки игры:', this.gameSettings);
        
        // Переходим к игровому экрану
        this.showScreen('game');
    }

    /**
     * Загрузка настроек
     */
    loadSettings() {
        console.log('📥 [MathApp] Загрузка настроек');
        this.gameSettings = this.services.storage.loadGameSettings();
        console.log('📥 [MathApp] Настройки загружены:', this.gameSettings);
    }

    /**
     * Сохранение настроек
     */
    saveSettings() {
        console.log('💾 [MathApp] Сохранение настроек');
        if (this.gameSettings) {
            this.services.storage.saveGameSettings(this.gameSettings);
        }
    }

    /**
     * Получение настроек игры
     */
    getGameSettings() {
        return this.gameSettings || {
            playerName: 'Игрок',
            maxNumber: 10,
            examplesCount: 5,
            operationType: 'addition'
        };
    }

    /**
     * Получение имени игрока
     */
    getPlayerName() {
        return this.services.storage.loadPlayerName() || 'Игрок';
    }

    /**
     * Получение текущего экрана
     */
    getCurrentScreen() {
        return this.currentScreen;
    }

    /**
     * Получение сервиса по имени
     */
    getService(serviceName) {
        return this.services[serviceName];
    }

    /**
     * Получение экрана по имени
     */
    getScreen(screenName) {
        return this.screens[screenName];
    }

    /**
     * Обработка ошибок
     */
    handleError(error, context = '') {
        console.error(`❌ [MathApp] Ошибка${context ? ` в ${context}` : ''}:`, error);
        
        // Можно добавить уведомления пользователю
        // alert(`Произошла ошибка${context ? ` в ${context}` : ''}. Попробуйте еще раз.`);
    }

    /**
     * Получение статистики приложения
     */
    getAppStats() {
        return {
            currentScreen: this.currentScreen,
            gameSettings: this.gameSettings,
            services: {
                game: this.services.game.getGameResults(),
                timer: this.services.timer.getTimerStats(),
                storage: this.services.storage.getPlayerStatistics()
            }
        };
    }

    /**
     * Сброс приложения
     */
    reset() {
        console.log('🔄 [MathApp] Сброс приложения');
        
        // Останавливаем все сервисы
        this.services.timer.stop();
        this.services.game.resetGame();
        
        // Сбрасываем настройки
        this.gameSettings = null;
        
        // Возвращаемся к экрану настроек
        this.showScreen('settings');
        
        console.log('✅ [MathApp] Приложение сброшено');
    }

    /**
     * Начать новую игру с текущими настройками
     */
    startNewGame() {
        console.log('🎯 [MathApp] Начало новой игры');
        
        // Загружаем текущие настройки
        this.loadSettings();
        
        // Проверяем, что настройки загружены
        if (!this.gameSettings) {
            console.log('⚠️ [MathApp] Настройки не найдены, переходим к экрану настроек');
            this.showScreen('settings');
            return;
        }
        
        // Начинаем новую игру с текущими настройками
        this.startGame();
        
        console.log('✅ [MathApp] Новая игра начата');
    }

    /**
     * Очистка всех данных
     */
    clearAllData() {
        console.log('🗑️ [MathApp] Очистка всех данных');
        
        if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
            this.services.storage.clearAllData();
            this.reset();
            alert('Все данные удалены');
        }
    }

    /**
     * Экспорт данных приложения
     */
    exportData() {
        console.log('📤 [MathApp] Экспорт данных');
        return this.services.storage.exportData();
    }

    /**
     * Импорт данных приложения
     */
    importData(jsonData) {
        console.log('📥 [MathApp] Импорт данных');
        const success = this.services.storage.importData(jsonData);
        if (success) {
            this.loadSettings();
            alert('Данные успешно импортированы');
        } else {
            alert('Ошибка импорта данных');
        }
        return success;
    }

    /**
     * Получение версии приложения
     */
    getVersion() {
        return window.APP_VERSION || '1.0.0';
    }

    /**
     * Получение информации о приложении
     */
    getAppInfo() {
        return {
            name: window.APP_NAME || 'Математические задачи',
            version: this.getVersion(),
            copyright: window.COPYRIGHT_YEAR || '2025',
            currentScreen: this.currentScreen,
            gameSettings: this.gameSettings
        };
    }

    /**
     * Обновление имени игрока в Header
     */
    updatePlayerNameInHeader(name) {
        const playerNameElement = document.getElementById('playerName');
        if (playerNameElement) {
            if (name && name.trim()) {
                playerNameElement.textContent = name.trim();
            } else {
                playerNameElement.textContent = 'Игрок';
            }
            console.log('👤 [MathApp] Имя игрока в Header обновлено:', name || 'Игрок');
        }
    }

    /**
     * Загрузка имени игрока в Header при инициализации
     */
    loadPlayerNameInHeader() {
        const playerName = this.services.storage.loadPlayerName();
        this.updatePlayerNameInHeader(playerName);
    }
}

// Инициализация приложения при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 [MathApp] Загрузка страницы завершена');
    
    // Инициализация версии
    if (window.APP_VERSION && window.APP_NAME && window.COPYRIGHT_YEAR) {
        // Обновляем мета-теги
        const versionMeta = document.getElementById('version-meta');
        const generatorMeta = document.getElementById('generator-meta');
        const pageTitle = document.getElementById('page-title');
        const footerText = document.getElementById('footer-text');
        
        if (versionMeta) versionMeta.setAttribute('content', window.APP_VERSION);
        if (generatorMeta) generatorMeta.setAttribute('content', `${window.APP_NAME} v${window.APP_VERSION}`);
        if (pageTitle) pageTitle.textContent = `${window.APP_NAME} v${window.APP_VERSION}`;
        if (footerText) footerText.textContent = `${window.APP_NAME} v${window.APP_VERSION}`;
    }
    
    // Создание экземпляра приложения
    window.mathApp = new MathApp();
    
    console.log('✅ [MathApp] Приложение запущено');
});
