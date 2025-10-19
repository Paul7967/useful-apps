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

        // Обработка выбора игрока из select
        this.addEventListener('playerNameSelect', 'change', () => {
            this.handlePlayerSelectChange();
        });

        // Обработка ввода нового имени
        this.addEventListener('playerNameInput', 'input', () => {
            this.updatePlayerName();
            this.savePlayerName();
        });

        // Обработка завершения ввода нового игрока
        this.addEventListener('playerNameInput', 'blur', () => {
            this.handleNewPlayerInput();
        });

        this.addEventListener('playerNameInput', 'keydown', (e) => {
            if (e.key === 'Enter') {
                this.handleNewPlayerInput();
            }
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
        
        // Обновляем select с игроками
        this.updatePlayerSelect();
        
        // Восстанавливаем выбранного игрока (после обновления списка)
        setTimeout(() => {
            this.restoreSelectedPlayer(playerName);
        }, 0);
        
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
        
        if (maxNumber > 500) {
            alert('Максимальное число не должно превышать 500');
            return;
        }
        
        if (examplesCount > 300) {
            alert('Количество примеров не должно превышать 300');
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

    /**
     * Обновить select с игроками
     */
    updatePlayerSelect() {
        const select = this.getElement('playerNameSelect');
        if (!select) return;
        
        const allPlayers = this.storageService.getAllPlayers();
        
        // Очищаем существующие опции (кроме первой: "добавить нового")
        while (select.children.length > 1) {
            select.removeChild(select.lastChild);
        }
        
        // Добавляем опции для каждого игрока
        allPlayers.forEach(player => {
            const option = document.createElement('option');
            option.value = player;
            option.textContent = player;
            select.appendChild(option);
        });
        
        console.log('👥 [SettingsScreen] Select обновлен с', allPlayers.length, 'игроками');
        console.log('👥 [SettingsScreen] Список игроков:', allPlayers);
        console.log('👥 [SettingsScreen] Опции в select:', Array.from(select.children).map(opt => opt.textContent));
    }

    /**
     * Обработка изменения выбора в select
     */
    handlePlayerSelectChange() {
        const select = this.getElement('playerNameSelect');
        const input = this.getElement('playerNameInput');
        
        if (!select || !input) return;
        
        const selectedValue = select.value;
        
        if (selectedValue === '__NEW_PLAYER__') {
            // Показать поле ввода для нового игрока
            input.style.display = 'block';
            input.focus();
            input.value = ''; // Очищаем поле
            console.log('👤 [SettingsScreen] Режим добавления нового игрока');
        } else {
            // Скрыть поле ввода и установить выбранного игрока
            input.style.display = 'none';
            this.setValue('playerNameInput', selectedValue);
            this.updatePlayerName();
            this.savePlayerName();
            
            // Сохраняем выбор в localStorage
            this.storageService.savePlayerName(selectedValue);
            console.log('👤 [SettingsScreen] Выбран и сохранен игрок:', selectedValue);
        }
    }

    /**
     * Обработка ввода нового игрока
     */
    handleNewPlayerInput() {
        const input = this.getElement('playerNameInput');
        const select = this.getElement('playerNameSelect');
        
        if (!input || !select) return;
        
        const newPlayerName = input.value.trim();
        
        if (newPlayerName.length > 0) {
            // Сохраняем нового игрока
            this.storageService.savePlayerName(newPlayerName);
            
            // Обновляем внутреннее состояние
            this.setValue('playerNameInput', newPlayerName);
            this.updatePlayerName();
            this.savePlayerName();
            
            // Обновляем список игроков в select
            this.updatePlayerSelect();
            
            // Выбираем нового игрока в select
            select.value = newPlayerName;
            
            // Скрываем поле ввода
            input.style.display = 'none';
            
            console.log('👤 [SettingsScreen] Добавлен новый игрок:', newPlayerName);
            console.log('👤 [SettingsScreen] Выбранное значение в select:', select.value);
            console.log('👤 [SettingsScreen] Опции после добавления:', Array.from(select.children).map(opt => opt.textContent));
        } else {
            // Если имя пустое, возвращаемся к опции добавления
            select.value = '__NEW_PLAYER__';
            input.style.display = 'none';
            console.log('👤 [SettingsScreen] Отменен ввод нового игрока');
        }
    }

    /**
     * Восстановить выбранного игрока при загрузке
     */
    restoreSelectedPlayer(playerName) {
        const select = this.getElement('playerNameSelect');
        if (!select) return;
        
        console.log('👤 [SettingsScreen] Восстановление игрока:', playerName);
        
        if (playerName && playerName.trim()) {
            // Проверяем, есть ли такой игрок в списке
            const allPlayers = this.storageService.getAllPlayers();
            console.log('👤 [SettingsScreen] Доступные игроки:', allPlayers);
            console.log('👤 [SettingsScreen] Опции в select:', Array.from(select.children).map(opt => opt.textContent));
            
            if (allPlayers.includes(playerName)) {
                // Выбираем существующего игрока
                select.value = playerName;
                console.log('👤 [SettingsScreen] Восстановлен игрок:', playerName);
                console.log('👤 [SettingsScreen] Выбранное значение:', select.value);
            } else {
                // Если игрок не найден в списке, выбираем опцию добавления
                select.value = '__NEW_PLAYER__';
                console.log('👤 [SettingsScreen] Игрок не найден в списке, режим добавления');
            }
        } else {
            // Если имя не задано, выбираем опцию добавления
            select.value = '__NEW_PLAYER__';
            console.log('👤 [SettingsScreen] Имя игрока не задано, режим добавления');
        }
    }
}
