/**
 * Экран настроек игры
 * Отвечает за настройку параметров игры и запуск
 */
class SettingsScreen extends BaseScreen {
    constructor(app) {
        super(app, 'settings');
        this.storageService = app.services.storage;
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        super.bindEvents();
        
        // Кнопка начала игры
        this.addEventListener('startGame', 'click', () => {
            this.startGame();
        });

        // Автосохранение при изменении полей
        this.addEventListener('playerNameInput', 'input', () => {
            this.updatePlayerName();
            this.savePlayerName();
        });

        this.addEventListener('maxNumber', 'change', () => {
            this.saveGameSettings();
        });

        this.addEventListener('examplesCount', 'change', () => {
            this.saveGameSettings();
        });

        // Автосохранение типа операций
        document.querySelectorAll('input[name="operationType"]').forEach(radio => {
            this.addEventListener(radio, 'change', () => {
                this.saveGameSettings();
            });
        });

        // Очистка данных
        this.addEventListener('clearData', 'click', () => {
            this.clearAllData();
        });

        console.log('📋 [SettingsScreen] События привязаны');
    }

    /**
     * Обработчик показа экрана
     */
    onShow() {
        console.log('📋 [SettingsScreen] Показываем экран настроек');
        this.loadSettings();
        this.updatePlayerName();
        this.focusFirstInput();
    }

    /**
     * Загрузка настроек
     */
    loadSettings() {
        console.log('📋 [SettingsScreen] Загрузка настроек');
        
        // Загружаем имя игрока
        const playerName = this.storageService.loadPlayerName();
        this.setValue('playerNameInput', playerName);
        
        // Загружаем настройки игры
        const settings = this.storageService.loadGameSettings();
        this.setValue('maxNumber', settings.maxNumber);
        this.setValue('examplesCount', settings.examplesCount);
        
        // Устанавливаем тип операций
        const operationRadio = document.querySelector(`input[name="operationType"][value="${settings.operationType}"]`);
        if (operationRadio) {
            operationRadio.checked = true;
        }
        
        console.log('📋 [SettingsScreen] Настройки загружены:', settings);
    }

    /**
     * Сохранение настроек игры
     */
    saveGameSettings() {
        const settings = {
            maxNumber: parseInt(this.getValue('maxNumber')) || 10,
            examplesCount: parseInt(this.getValue('examplesCount')) || 5,
            operationType: document.querySelector('input[name="operationType"]:checked')?.value || 'addition'
        };
        
        this.storageService.saveGameSettings(settings);
        console.log('💾 [SettingsScreen] Настройки игры сохранены:', settings);
    }

    /**
     * Сохранение имени игрока
     */
    savePlayerName() {
        const name = this.getValue('playerNameInput');
        if (name && name.trim()) {
            this.storageService.savePlayerName(name.trim());
            console.log('💾 [SettingsScreen] Имя игрока сохранено:', name.trim());
        }
    }

    /**
     * Обновление отображения имени игрока
     */
    updatePlayerName() {
        const name = this.getValue('playerNameInput');
        const playerNameSpan = this.getElement('playerName');
        
        if (playerNameSpan) {
            if (name && name.trim()) {
                playerNameSpan.textContent = name.trim();
            } else {
                playerNameSpan.textContent = 'Игрок';
            }
        }
        
        // Также обновляем имя в Header
        this.app.updatePlayerNameInHeader(name);
    }

    /**
     * Запуск игры
     */
    startGame() {
        console.log('🎮 [SettingsScreen] Запуск игры');
        
        // Валидация настроек
        const maxNumber = parseInt(this.getValue('maxNumber'));
        const examplesCount = parseInt(this.getValue('examplesCount'));
        
        if (maxNumber < 1 || examplesCount < 1) {
            alert('Пожалуйста, введите корректные значения (больше 0)');
            return;
        }
        
        if (maxNumber > 100) {
            alert('Максимальное число не должно превышать 100');
            return;
        }
        
        if (examplesCount > 50) {
            alert('Количество примеров не должно превышать 50');
            return;
        }
        
        // Сохраняем настройки
        this.saveGameSettings();
        this.savePlayerName();
        
        // Передаем управление главному приложению
        this.app.startGame();
    }

    /**
     * Установка фокуса на первое поле ввода
     */
    focusFirstInput() {
        const playerNameInput = this.getElement('playerNameInput');
        if (playerNameInput) {
            playerNameInput.focus();
        }
    }

    /**
     * Очистка всех данных
     */
    clearAllData() {
        if (confirm('Вы уверены, что хотите удалить все данные? Это действие нельзя отменить.')) {
            this.storageService.clearAllData();
            alert('Все данные удалены');
            this.loadSettings();
        }
    }

    /**
     * Получение текущих настроек
     */
    getCurrentSettings() {
        return {
            playerName: this.getValue('playerNameInput') || 'Игрок',
            maxNumber: parseInt(this.getValue('maxNumber')) || 10,
            examplesCount: parseInt(this.getValue('examplesCount')) || 5,
            operationType: document.querySelector('input[name="operationType"]:checked')?.value || 'addition'
        };
    }

    /**
     * Установка настроек
     */
    setSettings(settings) {
        if (settings.playerName) {
            this.setValue('playerNameInput', settings.playerName);
        }
        if (settings.maxNumber) {
            this.setValue('maxNumber', settings.maxNumber);
        }
        if (settings.examplesCount) {
            this.setValue('examplesCount', settings.examplesCount);
        }
        if (settings.operationType) {
            const radio = document.querySelector(`input[name="operationType"][value="${settings.operationType}"]`);
            if (radio) {
                radio.checked = true;
            }
        }
        
        this.updatePlayerName();
    }

    /**
     * Сброс к настройкам по умолчанию
     */
    resetToDefaults() {
        const defaultSettings = {
            playerName: '',
            maxNumber: 10,
            examplesCount: 5,
            operationType: 'addition'
        };
        
        this.setSettings(defaultSettings);
        this.saveGameSettings();
        console.log('🔄 [SettingsScreen] Настройки сброшены к значениям по умолчанию');
    }
}
