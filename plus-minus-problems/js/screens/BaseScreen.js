/**
 * Базовый класс для всех экранов приложения
 * Содержит общую логику показа/скрытия и управления событиями
 */
class BaseScreen {
    constructor(app, screenId) {
        this.app = app;
        this.screenId = screenId;
        this.element = null;
        this.isVisible = false;
        this.eventListeners = [];
    }

    /**
     * Инициализация экрана
     */
    init() {
        this.element = document.getElementById(`${this.screenId}-screen`);
        if (!this.element) {
            console.error(`❌ [${this.constructor.name}] Элемент ${this.screenId}-screen не найден`);
            return;
        }
        this.bindEvents();
        console.log(`✅ [${this.constructor.name}] Инициализирован экран ${this.screenId}`);
    }

    /**
     * Показать экран
     */
    show() {
        if (!this.element) {
            console.error(`❌ [${this.constructor.name}] Элемент не инициализирован`);
            return;
        }

        console.log(`🔄 [${this.constructor.name}] Показываем экран ${this.screenId}`);
        
        // Скрываем все экраны сразу
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active', 'fade-in');
            screen.style.display = 'none';
        });

        // Показываем текущий экран
        this.element.style.display = 'block';
        this.element.classList.add('active', 'fade-in');
        this.isVisible = true;
        this.onShow();
    }

    /**
     * Скрыть экран
     */
    hide() {
        if (!this.element) return;

        console.log(`🔄 [${this.constructor.name}] Скрываем экран ${this.screenId}`);
        this.element.classList.remove('active', 'fade-in');
        this.element.style.display = 'none';
        this.isVisible = false;
        this.onHide();
    }

    /**
     * Привязка событий (переопределяется в дочерних классах)
     */
    bindEvents() {
        // Базовая реализация - переопределяется в дочерних классах
    }

    /**
     * Обработчик показа экрана (переопределяется в дочерних классах)
     */
    onShow() {
        // Базовая реализация - переопределяется в дочерних классах
    }

    /**
     * Обработчик скрытия экрана (переопределяется в дочерних классах)
     */
    onHide() {
        // Базовая реализация - переопределяется в дочерних классах
    }

    /**
     * Добавление обработчика события с автоматической очисткой
     */
    addEventListener(element, event, handler) {
        if (typeof element === 'string') {
            element = document.getElementById(element);
        }
        
        if (element) {
            element.addEventListener(event, handler);
            this.eventListeners.push({ element, event, handler });
        }
    }

    /**
     * Очистка всех обработчиков событий
     */
    cleanup() {
        this.eventListeners.forEach(({ element, event, handler }) => {
            element.removeEventListener(event, handler);
        });
        this.eventListeners = [];
    }

    /**
     * Получение элемента по ID
     */
    getElement(id) {
        return document.getElementById(id);
    }

    /**
     * Получение значения элемента
     */
    getValue(id) {
        const element = this.getElement(id);
        return element ? element.value : null;
    }

    /**
     * Установка значения элемента
     */
    setValue(id, value) {
        const element = this.getElement(id);
        if (element) {
            element.value = value;
        }
    }

    /**
     * Установка текста элемента
     */
    setText(id, text) {
        const element = this.getElement(id);
        if (element) {
            element.textContent = text;
        }
    }

    /**
     * Показать/скрыть элемент
     */
    toggleElement(id, show) {
        const element = this.getElement(id);
        if (element) {
            element.style.display = show ? 'block' : 'none';
        }
    }

    /**
     * Добавление/удаление CSS класса
     */
    toggleClass(id, className, add) {
        const element = this.getElement(id);
        if (element) {
            if (add) {
                element.classList.add(className);
            } else {
                element.classList.remove(className);
            }
        }
    }
}
