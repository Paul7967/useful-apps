/**
 * Экран игры "Состав числа"
 */
class CompositionScreen extends BaseScreen {
    constructor(app) {
        super(app, 'composition');
        this.storageService = app.services.storage;
    }

    /**
     * Привязка событий
     */
    bindEvents() {
        super.bindEvents();
        
        console.log('🔢 [CompositionScreen] Привязка событий...');
        
        // Кнопка начала игры
        this.addEventListener('startComposition', 'click', () => {
            console.log('🔢 [CompositionScreen] Нажата кнопка startComposition');
            this.startCompositionGame();
        });

        // Валидация диапазона при изменении значений
        this.addEventListener('compositionMinNumber', 'change', () => {
            console.log('🔢 [CompositionScreen] Изменено значение compositionMinNumber:', this.getValue('compositionMinNumber'));
            this.validateRange();
            this.saveCompositionSettings(); // Автоматически сохраняем при изменении
        });

        this.addEventListener('compositionMaxNumber', 'change', () => {
            console.log('🔢 [CompositionScreen] Изменено значение compositionMaxNumber:', this.getValue('compositionMaxNumber'));
            this.validateRange();
            this.saveCompositionSettings(); // Автоматически сохраняем при изменении
        });

        // Обработчик для настройки повторений
        this.addEventListener('compositionRepetitions', 'change', () => {
            console.log('🔢 [CompositionScreen] Изменено значение compositionRepetitions:', this.getValue('compositionRepetitions'));
            this.saveCompositionSettings();
        });

        console.log('🔢 [CompositionScreen] События привязаны');
    }

    /**
     * Обработчик показа экрана
     */
    onShow() {
        console.log('🔢 [CompositionScreen] Показываем экран Состав числа');
        
        // Всегда загружаем настройки при показе экрана
        console.log('🔢 [CompositionScreen] Загружаем настройки при показе экрана');
        this.loadCompositionSettings();
    }

    /**
     * Загрузка настроек игры
     */
    loadCompositionSettings() {
        // Загружаем сохраненные настройки
        const savedSettings = this.storageService.loadCompositionSettings();
        console.log('🔢 [CompositionScreen] Загруженные настройки:', savedSettings);
        
        // Функция для установки значений
        const setValues = (minNumber, maxNumber, repetitions) => {
            console.log('🔢 [CompositionScreen] Устанавливаем значения:', { minNumber, maxNumber, repetitions });
            this.setValue('compositionMinNumber', minNumber);
            this.setValue('compositionMaxNumber', maxNumber);
            this.setValue('compositionRepetitions', repetitions);
            
            // Проверяем, что значения действительно установились
            setTimeout(() => {
                const actualMin = this.getValue('compositionMinNumber');
                const actualMax = this.getValue('compositionMaxNumber');
                const actualRep = this.getValue('compositionRepetitions');
                console.log('🔢 [CompositionScreen] Проверка установки значений:', {
                    expected: { minNumber, maxNumber, repetitions },
                    actual: { minNumber: actualMin, maxNumber: actualMax, repetitions: actualRep }
                });
            }, 10);
        };
        
        if (savedSettings && savedSettings.minNumber && savedSettings.maxNumber) {
            // Восстанавливаем сохраненные значения
            console.log('🔢 [CompositionScreen] Восстанавливаем сохраненные значения');
            setValues(savedSettings.minNumber, savedSettings.maxNumber, savedSettings.repetitions || 3);
        } else {
            // Устанавливаем значения по умолчанию
            console.log('🔢 [CompositionScreen] Используем значения по умолчанию');
            setValues(1, 20, 3);
        }
        
        // Проверяем и корректируем значения через несколько попыток
        let attempts = 0;
        const maxAttempts = 10; // Увеличиваем количество попыток
        
        const checkAndCorrect = () => {
            attempts++;
            const currentMin = this.getValue('compositionMinNumber');
            const currentMax = this.getValue('compositionMaxNumber');
            const currentRep = this.getValue('compositionRepetitions');
            
            console.log(`🔢 [CompositionScreen] Проверка ${attempts}:`, {
                minNumber: currentMin,
                maxNumber: currentMax,
                repetitions: currentRep
            });
            
            // Если есть сохраненные настройки, проверяем соответствие
            if (savedSettings && savedSettings.minNumber && savedSettings.maxNumber) {
                const needsCorrection = currentMin != savedSettings.minNumber || 
                                      currentMax != savedSettings.maxNumber || 
                                      currentRep != (savedSettings.repetitions || 3);
                
                if (needsCorrection) {
                    if (attempts < maxAttempts) {
                        console.log(`🔢 [CompositionScreen] Повторная попытка ${attempts} - исправляем значения`);
                        setValues(savedSettings.minNumber, savedSettings.maxNumber, savedSettings.repetitions || 3);
                        setTimeout(checkAndCorrect, 100); // Увеличиваем задержку
                    } else {
                        console.log('🔢 [CompositionScreen] Максимальное количество попыток достигнуто');
                        console.log('🔢 [CompositionScreen] Финальные значения:', {
                            minNumber: this.getValue('compositionMinNumber'),
                            maxNumber: this.getValue('compositionMaxNumber'),
                            repetitions: this.getValue('compositionRepetitions')
                        });
                    }
                } else {
                    console.log('🔢 [CompositionScreen] Все значения успешно установлены');
                }
            } else {
                console.log('🔢 [CompositionScreen] Нет сохраненных настроек, используем значения по умолчанию');
            }
        };
        
        // Начинаем проверку через небольшую задержку
        setTimeout(checkAndCorrect, 100);
        
        // Принудительно сохраняем настройки после установки
        setTimeout(() => {
            console.log('🔢 [CompositionScreen] Принудительное сохранение настроек');
            this.saveCompositionSettings();
        }, 500);
        
        console.log('🔢 [CompositionScreen] Настройки загружены');
    }

    /**
     * Сохранение настроек игры
     */
    saveCompositionSettings() {
        const minNumber = parseInt(this.getValue('compositionMinNumber'));
        const maxNumber = parseInt(this.getValue('compositionMaxNumber'));
        const repetitions = parseInt(this.getValue('compositionRepetitions'));
        
        console.log('💾 [CompositionScreen] Текущие значения в DOM:', {
            minNumber: this.getValue('compositionMinNumber'),
            maxNumber: this.getValue('compositionMaxNumber'),
            repetitions: this.getValue('compositionRepetitions')
        });
        
        console.log('💾 [CompositionScreen] Парсированные значения:', {
            minNumber: minNumber,
            maxNumber: maxNumber,
            repetitions: repetitions
        });
        
        // Проверяем, что значения корректны
        if (isNaN(minNumber) || isNaN(maxNumber) || isNaN(repetitions)) {
            console.error('❌ [CompositionScreen] Некорректные значения, не сохраняем');
            return;
        }
        
        const settings = {
            minNumber: minNumber,
            maxNumber: maxNumber,
            repetitions: repetitions,
            range: `${minNumber}-${maxNumber}`
        };
        
        this.storageService.saveCompositionSettings(settings);
        console.log('💾 [CompositionScreen] Настройки сохранены:', settings);
    }

    /**
     * Запуск игры "Состав числа"
     */
    startCompositionGame() {
        // Проверяем валидность диапазона
        if (!this.validateRange()) {
            return;
        }
        
        const minNumber = parseInt(this.getValue('compositionMinNumber'));
        const maxNumber = parseInt(this.getValue('compositionMaxNumber'));
        const repetitions = parseInt(this.getValue('compositionRepetitions'));
        const selectedRange = `${minNumber}-${maxNumber}`;
        
        // Сохраняем настройки
        this.saveCompositionSettings();
        
        console.log('🔢 [CompositionScreen] Запуск игры с диапазоном:', selectedRange, 'повторений:', repetitions);
        
        // Переходим к игровому экрану
        this.app.startCompositionGame(selectedRange, repetitions);
    }

    /**
     * Получение текущих настроек
     */
    getCurrentSettings() {
        const minNumber = parseInt(this.getValue('compositionMinNumber'));
        const maxNumber = parseInt(this.getValue('compositionMaxNumber'));
        const repetitions = parseInt(this.getValue('compositionRepetitions'));
        return {
            minNumber: minNumber,
            maxNumber: maxNumber,
            repetitions: repetitions,
            range: `${minNumber}-${maxNumber}`
        };
    }

    /**
     * Валидация диапазона
     */
    validateRange() {
        const minNumber = parseInt(this.getValue('compositionMinNumber'));
        const maxNumber = parseInt(this.getValue('compositionMaxNumber'));
        const errorElement = this.getElement('rangeError');
        
        if (isNaN(minNumber) || isNaN(maxNumber)) {
            return false;
        }
        
        if (minNumber >= maxNumber) {
            errorElement.style.display = 'block';
            return false;
        } else {
            errorElement.style.display = 'none';
            return true;
        }
    }
}
