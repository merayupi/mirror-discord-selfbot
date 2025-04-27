class Logger {
    constructor() {
        this.logLevels = {
            INFO: 'INFO',
            WARN: 'WARN',
            ERROR: 'ERROR',
            DEBUG: 'DEBUG'
        };
    }

    formatMessage(level, message, error) {
        const timestamp = new Date().toISOString();
        let formattedMessage = `[${timestamp}] [${level}] ${message}`;

        if (error) {
            if (typeof error === 'object' && error.stack) {
                formattedMessage += `\n${error.stack}`;
            } else {
                formattedMessage += `\n${error}`;
            }
        }

        return formattedMessage;
    }

    info(message) {
        console.log(this.formatMessage(this.logLevels.INFO, message));
    }

    warn(message, error) {
        console.warn(this.formatMessage(this.logLevels.WARN, message, error));
    }

    error(message, error) {
        console.error(this.formatMessage(this.logLevels.ERROR, message, error));
    }

    debug(message) {
        if (process.env.DEBUG === 'true') {
            console.debug(this.formatMessage(this.logLevels.DEBUG, message));
        }
    }
}

const logger = new Logger();
export default logger;
