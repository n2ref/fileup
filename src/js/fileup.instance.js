import fileUpUtils   from './fileup.utils';
import fileUpPrivate from './fileup.private';
import tpl           from './fileup.templates';

let fileUpInstance = {

    _options: {
        id: null,
        url: null,
        input: null,
        queue: null,
        dropzone: null,
        files: [],
        fieldName: 'file',
        extraFields: {},
        lang: 'en',
        langItems: null,
        sizeLimit: 0,
        filesLimit: 0,
        httpMethod: 'post',
        timeout: null,
        autostart: false,
        showClose: true,
        templateFile: null,

        onSelect: null,
        onRemove: null,
        onBeforeStart: null,
        onStart: null,
        onProgress: null,
        onAbort: null,
        onSuccess: null,
        onFinish: null,
        onError: null,
        onDragOver: null,
        onDragLeave: null,
        onDragEnd: null,
        onDragEnter: null,

        iconDefault: 'bi bi-file-earmark-text',
        mimeTypes: {
            archive: {
                mime: ['application/zip', 'application/gzip', 'application/x-bzip', 'application/x-bzip2', 'application/x-7z-compressed'],
                ext: ['zip', '7z', 'bz', 'bz2', 'gz', 'jar', 'rar', 'tar'],
                icon: 'bi bi-file-earmark-zip'
            },
            word: {
                mime: ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
                ext: ['doc', 'docx'],
                icon: 'bi bi-file-earmark-word'
            },
            excel: {
                mime: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
                ext: ['xls', 'xlsx'],
                icon: 'bi bi-file-earmark-excel'
            },
            video: {
                mime: /video\/.*/,
                ext: ['avi', 'mp4', 'mpeg', 'ogv', 'ts', 'webm', '3gp', '3g2', 'mkv'],
                icon: 'bi bi-file-earmark-play'
            },
            audio: {
                mime: /audio\/.*/,
                ext: ['avi', 'mp4', 'mpeg', 'ogv', 'ts', 'webm', '3gp', '3g2', 'mkv'],
                icon: 'bi bi-file-earmark-music'
            },
            pdf: {
                mime: ['application/pdf'],
                ext: ['pdf'],
                icon: 'bi bi-file-earmark-pdf'
            },
            binary: {
                mime: ['application\/octet-stream'],
                ext: ['bin', 'exe', 'dat', 'dll'],
                icon: 'bi bi-file-earmark-binary'
            }
        }
    },

    _id: null,
    _fileIndex: 0,
    _input: null,
    _queue: null,
    _dropzone: null,
    _files: {},
    _events: {},


    /**
     * Инициализация
     * @param {object} options
     * @private
     */
    _init: function (options) {

        if (typeof options.url !== 'string' || ! options.url) {
            throw new Error('Dont set url param');
        }

        this._options = $.extend(true, {}, this._options, options);
        this._id      = typeof this._options.id === 'string' && this._options.id
            ? this._options.id
            : fileUpUtils.hashCode();

        if ( ! this._options.templateFile || typeof this._options.templateFile !== 'string') {
            this._options.templateFile = tpl['file.html'];
        }


        fileUpPrivate.initInput(this);
        fileUpPrivate.initQueue(this);
        fileUpPrivate.initDropzone(this);
        fileUpPrivate.initEvents(this);

        fileUpPrivate.renderFiles(this);
    },


    /**
     * Получение параметров
     * @returns {object}
     */
    getOptions: function () {
        return this._options;
    },


    /**
     * Получение id
     * @return {string|null}
     */
    getId: function () {
        return this._id;
    },


    /**
     * Получение input
     * @return {jQuery|null}
     */
    getInput: function () {
        return this._input;
    },


    /**
     * Получение queue
     * @return {jQuery|null}
     */
    getQueue: function () {
        return this._queue;
    },


    /**
     * Получение dropzone
     * @return {jQuery|null}
     */
    getDropzone: function () {
        return this._dropzone;
    },


    /**
     * Подписка на событие
     * @param {string}           eventName
     * @param {function|string}  callback
     * @param {object|undefined} context
     */
    on: function(eventName, callback, context) {
        if (typeof this._events[eventName] !== 'object') {
            this._events[eventName] = [];
        }
        this._events[eventName].push({
            context : context || this,
            callback: callback,
            singleExec: false
        });
    },


    /**
     * Подписка на событие таким образом, что выполнение произойдет лишь один раз
     * @param {string}           eventName
     * @param {function|string}  callback
     * @param {object|undefined} context
     */
    one: function(eventName, callback, context) {
        if (typeof this._events[eventName] !== 'object') {
            this._events[eventName] = [];
        }
        this._events[eventName].push({
            context : context || this,
            callback: callback,
            singleExec: true,
        });
    },


    /**
     * Получение настроек языка
     */
    getLang: function () {
        return $.extend(true, {}, this._options.langItems);
    },


    /**
     * Получение всех файлов
     * @return {object}
     */
    getFiles: function () {

        return this._files;
    },


    /**
     * Получение файла по его id
     * @param {int} fileId
     * @return {object|null}
     */
    getFileById: function (fileId) {

        let result = null;

        $.each(this._files, function (key, file) {
            if (fileId === file.getId()) {
                result = file;
            }
        });

        return result;
    },


    /**
     * Удаление всех файлов
     */
    removeAll: function() {

        $.each(this._files, function (key, file) {
            file.remove();
        });
    },


    /**
     * Загрузка всех файлов
     */
    uploadAll: function() {

        $.each(this._files, function (key, file) {
            file.upload();
        });
    },


    /**
     * Отмена загрузки всех файлов
     */
    abortAll: function() {

        $.each(this._files, function (key, file) {
            file.abort();
        });
    }
}

export default fileUpInstance;