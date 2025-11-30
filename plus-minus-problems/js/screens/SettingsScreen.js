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

        // Кнопка добавления игрока
        this.addEventListener('addPlayerBtn', 'click', () => {
            this.showAddPlayerModal();
        });

        // Модальное окно добавления игрока
        this.addEventListener('closeModalBtn', 'click', () => {
            this.hideAddPlayerModal();
        });

        this.addEventListener('cancelAddPlayer', 'click', () => {
            this.hideAddPlayerModal();
        });

        this.addEventListener('confirmAddPlayer', 'click', () => {
            this.addNewPlayer();
        });

        // Обработка нажатия Enter в поле имени нового игрока
        this.addEventListener('newPlayerName', 'keydown', (e) => {
            if (e.key === 'Enter') {
                this.addNewPlayer();
            }
        });

        this.addEventListener('minNumber', 'change', () => {
            this.validateNumberRange();
            this.saveGameSettings();
        });

        this.addEventListener('maxNumber', 'change', () => {
            this.validateNumberRange();
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
        this.setValue('minNumber', settings.minNumber || 1);
        this.setValue('maxNumber', settings.maxNumber);
        this.setValue('examplesCount', settings.examplesCount);
        
        // Устанавливаем тип операций
        const operationRadio = document.querySelector(`input[name="operationType"][value="${settings.operationType}"]`);
        if (operationRadio) {
            operationRadio.checked = true;
        }
        
        // Проверяем валидность диапазона после загрузки
        setTimeout(() => {
            this.validateNumberRange();
        }, 0);
        
        console.log('📋 [SettingsScreen] Настройки загружены:', settings);
    }

    /**
     * Сохранение настроек игры
     */
    saveGameSettings() {
        const settings = {
            minNumber: parseInt(this.getValue('minNumber')) || 1,
            maxNumber: parseInt(this.getValue('maxNumber')) || 10,
            examplesCount: parseInt(this.getValue('examplesCount')) || 5,
            operationType: document.querySelector('input[name="operationType"]:checked')?.value || 'addition'
        };
        
        this.storageService.saveGameSettings(settings);
        console.log('💾 [SettingsScreen] Настройки игры сохранены:', settings);
    }

    /**
     * Валидация диапазона чисел
     */
    validateNumberRange() {
        const minNumber = parseInt(this.getValue('minNumber')) || 1;
        const maxNumber = parseInt(this.getValue('maxNumber')) || 10;
        const errorElement = document.getElementById('numberRangeError');
        
        if (minNumber >= maxNumber - 5) {
            if (errorElement) {
                errorElement.style.display = 'block';
            }
            return false;
        } else {
            if (errorElement) {
                errorElement.style.display = 'none';
            }
            return true;
        }
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
        const minNumber = parseInt(this.getValue('minNumber')) || 1;
        const maxNumber = parseInt(this.getValue('maxNumber'));
        const examplesCount = parseInt(this.getValue('examplesCount'));
        
        if (minNumber < 1 || maxNumber < 1 || examplesCount < 1) {
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
        
        // Проверка диапазона: минимальное число должно быть меньше максимального более чем на 5
        if (minNumber >= maxNumber - 5) {
            alert('Минимальное число должно быть меньше максимального более чем на 5');
            this.validateNumberRange();
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
            minNumber: parseInt(this.getValue('minNumber')) || 1,
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
        if (settings.minNumber !== undefined) {
            this.setValue('minNumber', settings.minNumber);
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
            minNumber: 1,
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
        
        // Очищаем все существующие опции
        select.innerHTML = '';
        
        if (allPlayers.length === 0) {
            // Если нет игроков, отключаем select и добавляем placeholder
            select.disabled = true;
            const placeholderOption = document.createElement('option');
            placeholderOption.value = '';
            placeholderOption.textContent = 'Нет доступных игроков';
            placeholderOption.disabled = true;
            select.appendChild(placeholderOption);
            console.log('👥 [SettingsScreen] Select отключен - нет игроков');
        } else {
            // Если есть игроки, включаем select и добавляем опции
            select.disabled = false;
            allPlayers.forEach(player => {
                const option = document.createElement('option');
                option.value = player;
                option.textContent = player;
                select.appendChild(option);
            });
            console.log('👥 [SettingsScreen] Select обновлен с', allPlayers.length, 'игроками');
        }
        
        console.log('👥 [SettingsScreen] Список игроков:', allPlayers);
        console.log('👥 [SettingsScreen] Опции в select:', Array.from(select.children).map(opt => opt.textContent));
    }

    /**
     * Обработка изменения выбора в select
     */
    handlePlayerSelectChange() {
        const select = this.getElement('playerNameSelect');
        
        if (!select) return;
        
        const selectedValue = select.value;
        
        if (selectedValue) {
            // Устанавливаем выбранного игрока
            this.setValue('playerNameInput', selectedValue);
            this.updatePlayerName();
            this.savePlayerName();
            
            // Сохраняем выбор в localStorage
            this.storageService.savePlayerName(selectedValue);
            console.log('👤 [SettingsScreen] Выбран и сохранен игрок:', selectedValue);
        }
    }


    /**
     * Восстановить выбранного игрока при загрузке
     */
    restoreSelectedPlayer(playerName) {
        const select = this.getElement('playerNameSelect');
        if (!select) return;
        
        console.log('👤 [SettingsScreen] Восстановление игрока:', playerName);
        
        // Если select отключен (нет игроков), ничего не делаем
        if (select.disabled) {
            console.log('👤 [SettingsScreen] Select отключен, восстановление пропущено');
            return;
        }
        
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
                // Если игрок не найден в списке, выбираем первого доступного
                if (allPlayers.length > 0) {
                    select.value = allPlayers[0];
                    console.log('👤 [SettingsScreen] Игрок не найден, выбран первый доступный:', allPlayers[0]);
                }
            }
        } else {
            // Если имя не задано, выбираем первого доступного игрока
            const allPlayers = this.storageService.getAllPlayers();
            if (allPlayers.length > 0) {
                select.value = allPlayers[0];
                console.log('👤 [SettingsScreen] Имя игрока не задано, выбран первый доступный:', allPlayers[0]);
            }
        }
    }

    /**
     * Показать модальное окно добавления игрока
     */
    showAddPlayerModal() {
        console.log('👤 [SettingsScreen] Показываем модальное окно добавления игрока');
        const modal = document.getElementById('addPlayerModal');
        const input = document.getElementById('newPlayerName');
        
        if (modal && input) {
            modal.style.display = 'block';
            input.value = '';
            input.focus();
            
            // Закрытие по клику вне модального окна
            modal.addEventListener('click', this.handleModalClick.bind(this));
        }
    }

    /**
     * Скрыть модальное окно добавления игрока
     */
    hideAddPlayerModal() {
        console.log('👤 [SettingsScreen] Скрываем модальное окно добавления игрока');
        const modal = document.getElementById('addPlayerModal');
        
        if (modal) {
            modal.style.display = 'none';
            modal.removeEventListener('click', this.handleModalClick.bind(this));
        }
    }

    /**
     * Обработка клика по модальному окну
     */
    handleModalClick(e) {
        const modal = document.getElementById('addPlayerModal');
        if (e.target === modal) {
            this.hideAddPlayerModal();
        }
    }

    /**
     * Добавить нового игрока
     */
    addNewPlayer() {
        console.log('👤 [SettingsScreen] Добавление нового игрока');
        const input = document.getElementById('newPlayerName');
        
        if (!input) return;
        
        const newPlayerName = input.value.trim();
        
        if (!newPlayerName) {
            alert('Пожалуйста, введите имя игрока');
            input.focus();
            return;
        }
        
        if (newPlayerName.length < 2) {
            alert('Имя игрока должно содержать минимум 2 символа');
            input.focus();
            return;
        }
        
        // Проверяем, не существует ли уже такой игрок
        const existingPlayers = this.storageService.getAllPlayers();
        if (existingPlayers.includes(newPlayerName)) {
            alert('Игрок с таким именем уже существует');
            input.focus();
            return;
        }
        
        // Сохраняем имя игрока
        this.storageService.savePlayerName(newPlayerName);
        
        // Обновляем список игроков в select
        this.updatePlayerSelect();
        
        // Выбираем нового игрока
        const select = document.getElementById('playerNameSelect');
        if (select) {
            select.value = newPlayerName;
            this.handlePlayerSelectChange();
        }
        
        // Скрываем модальное окно
        this.hideAddPlayerModal();
        
        console.log('✅ [SettingsScreen] Новый игрок добавлен:', newPlayerName);
    }
}
