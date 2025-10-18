/**
 * Сервис для управления таймером
 * Отвечает за запуск, остановку и отслеживание времени игры
 */
class TimerService {
    constructor() {
        this.startTime = null;
        this.timerInterval = null;
        this.isRunning = false;
        this.callbacks = [];
    }

    /**
     * Запуск таймера
     */
    start() {
        if (this.isRunning) {
            console.log('⏰ [TimerService] Таймер уже запущен');
            return;
        }

        console.log('⏰ [TimerService] Запуск таймера');
        this.startTime = Date.now();
        this.isRunning = true;
        
        // Обновляем таймер каждую секунду
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
        
        console.log('⏰ [TimerService] Таймер запущен');
    }

    /**
     * Остановка таймера
     */
    stop() {
        if (!this.isRunning) {
            console.log('⏰ [TimerService] Таймер уже остановлен');
            return;
        }

        console.log('⏰ [TimerService] Остановка таймера');
        
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        
        this.isRunning = false;
        console.log('⏰ [TimerService] Таймер остановлен');
    }

    /**
     * Сброс таймера
     */
    reset() {
        console.log('⏰ [TimerService] Сброс таймера');
        this.stop();
        this.startTime = null;
    }

    /**
     * Получение прошедшего времени в миллисекундах
     */
    getElapsedTime() {
        if (!this.startTime) {
            return 0;
        }
        return Date.now() - this.startTime;
    }

    /**
     * Получение прошедшего времени в секундах
     */
    getElapsedSeconds() {
        return Math.floor(this.getElapsedTime() / 1000);
    }

    /**
     * Получение времени в формате MM:SS
     */
    getFormattedTime() {
        const elapsed = this.getElapsedTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    /**
     * Обновление таймера (вызывается каждую секунду)
     */
    updateTimer() {
        if (!this.isRunning) return;

        const elapsed = this.getElapsedTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        const timeString = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        // Уведомляем всех подписчиков об обновлении
        this.notifyCallbacks({
            elapsed: elapsed,
            seconds: this.getElapsedSeconds(),
            formatted: timeString,
            minutes: minutes,
            seconds: seconds
        });
        
        // Логируем каждые 10 секунд, чтобы не засорять консоль
        if (seconds % 10 === 0) {
            console.log(`⏰ [TimerService] Прошло времени: ${timeString}`);
        }
    }

    /**
     * Подписка на обновления таймера
     */
    subscribe(callback) {
        if (typeof callback === 'function') {
            this.callbacks.push(callback);
            console.log('⏰ [TimerService] Добавлен подписчик на обновления таймера');
        }
    }

    /**
     * Отписка от обновлений таймера
     */
    unsubscribe(callback) {
        const index = this.callbacks.indexOf(callback);
        if (index > -1) {
            this.callbacks.splice(index, 1);
            console.log('⏰ [TimerService] Удален подписчик на обновления таймера');
        }
    }

    /**
     * Уведомление всех подписчиков
     */
    notifyCallbacks(timerData) {
        this.callbacks.forEach(callback => {
            try {
                callback(timerData);
            } catch (error) {
                console.error('❌ [TimerService] Ошибка в callback таймера:', error);
            }
        });
    }

    /**
     * Проверка, запущен ли таймер
     */
    isActive() {
        return this.isRunning;
    }

    /**
     * Получение времени начала
     */
    getStartTime() {
        return this.startTime;
    }

    /**
     * Установка времени начала (для восстановления)
     */
    setStartTime(timestamp) {
        this.startTime = timestamp;
        console.log('⏰ [TimerService] Время начала установлено:', new Date(timestamp));
    }

    /**
     * Получение статистики таймера
     */
    getTimerStats() {
        return {
            isRunning: this.isRunning,
            startTime: this.startTime,
            elapsedTime: this.getElapsedTime(),
            elapsedSeconds: this.getElapsedSeconds(),
            formattedTime: this.getFormattedTime(),
            subscribers: this.callbacks.length
        };
    }

    /**
     * Очистка всех подписчиков
     */
    clearSubscribers() {
        this.callbacks = [];
        console.log('⏰ [TimerService] Все подписчики очищены');
    }

    /**
     * Получение времени в удобном формате для отображения
     */
    getDisplayTime() {
        const elapsed = this.getElapsedTime();
        const minutes = Math.floor(elapsed / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        if (minutes > 0) {
            return `${minutes}м ${seconds}с`;
        } else {
            return `${seconds}с`;
        }
    }
}
