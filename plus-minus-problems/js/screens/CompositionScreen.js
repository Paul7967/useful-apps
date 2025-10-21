/**
 * Экран игры "Состав числа"
 */
class CompositionScreen extends BaseScreen {
    constructor(app) {
        super('composition-screen', app);
        this.storageService = app.services.storage;
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        super.bindEvents();
        
        // Кнопка начала игры
        this.addEventListener('startComposition', 'click', () => {
            this.startCompositionGame();
        });

        console.log('🔢 [CompositionScreen] События привязаны');
    }

    /**
     * Обработчик показа экрана
     */
    onShow() {
        console.log('🔢 [CompositionScreen] Показываем экран Состав числа');
        this.loadCompositionSettings();
    }

    /**
     * Загрузка настроек игры
     */
    loadCompositionSettings() {
        // Загружаем сохраненное число или устанавливаем по умолчанию
        const savedNumber = this.storageService.loadCompositionNumber();
        if (savedNumber) {
            this.setValue('compositionNumber', savedNumber);
        } else {
            this.setValue('compositionNumber', '5'); // По умолчанию число 5
        }
        
        console.log('🔢 [CompositionScreen] Настройки загружены');
    }

    /**
     * Сохранение настроек игры
     */
    saveCompositionSettings() {
        const number = this.getValue('compositionNumber');
        this.storageService.saveCompositionNumber(number);
        console.log('💾 [CompositionScreen] Настройки сохранены:', number);
    }

    /**
     * Запуск игры "Состав числа"
     */
    startCompositionGame() {
        const selectedNumber = this.getValue('compositionNumber');
        
        if (!selectedNumber) {
            alert('Пожалуйста, выберите число для изучения');
            return;
        }
        
        // Сохраняем настройки
        this.saveCompositionSettings();
        
        console.log('🔢 [CompositionScreen] Запуск игры с числом:', selectedNumber);
        
        // Пока что просто показываем сообщение
        alert(`Игра "Состав числа" для числа ${selectedNumber} будет реализована в следующих версиях!`);
        
        // В будущем здесь будет переход к игровому экрану
        // this.app.startCompositionGame(selectedNumber);
    }

    /**
     * Получение текущих настроек
     */
    getCurrentSettings() {
        return {
            compositionNumber: this.getValue('compositionNumber') || '5'
        };
    }
}
