import fileUpPrivate from "./fileup.private";
import fileUpUtils   from "./fileup.utils";

let fileUpFile = {

    _options: {
        id: null,
        name: null,
        type: null,
        size: null,
        status: null,
        urlPreview: null,
        urlDownload: null,
    },

    _id: '',
    _status: 'stand_by',
    _fileElement: null,
    _fileData: null,
    _fileUp: null,
    _xhr: null,


    /**
     * Инициализация
     * @param {object} fileUp
     * @param {object} options
     * @param {File}   fileData
     * @private
     */
    _init: function (fileUp, options, fileData) {

        if ( ! fileUpUtils.isObject(options)) {
            throw new Error('File incorrect options param');
        }

        if (typeof options.id !== 'number' || options.id < 0) {
            throw new Error('File dont set or incorrect id param');
        }
        if (typeof options.name !== 'string' || ! options.name) {
            throw new Error('File dont set name param');
        }

        this._fileUp  = fileUp;
        this._options = $.extend(true, {}, this._options, options);
        this._id      = this._options.id;
        this._status  = typeof this._options.status === 'string' && this._options.status
            ? this._options.status
            : 'stand_by';


        if (fileData instanceof File) {
            let xhr = null;

            if (window.XMLHttpRequest) {
                xhr = ("onload" in new XMLHttpRequest()) ? new XMLHttpRequest : new XDomainRequest;

            } else if (window.ActiveXObject) {
                try {
                    xhr = new ActiveXObject("Msxml2.XMLHTTP");
                } catch (e) {
                    try {
                        xhr = new ActiveXObject("Microsoft.XMLHTTP");
                    } catch (e) {
                        fileUpPrivate.trigger(fileUp, 'error', ['old_browser', { file: this }]);
                    }
                }
            } else {
                fileUpPrivate.trigger(fileUp, 'error', ['old_browser', { file: this }]);
            }

            if ( ! xhr) {
                throw new Error('xhr dont created. Check your browser');
            }

            this._xhr      = xhr;
            this._fileData = fileData;

        } else {
            this._status = 'finish';
        }
    },


    /**
     * Получение id файла
     * @return {null}
     */
    getId: function () {
        return this._id;
    },


    /**
     * Получение name
     * @return {string|null}
     */
    getName: function () {

        return this._fileData
            ? fileUpUtils.getFileName(this._fileData)
            : this._options.name;
    },


    /**
     * Получение элемента файла
     * @return {jQuery|null}
     */
    getElement: function () {
        return this._fileElement;
    },


    /**
     * Получение urlPreview
     * @return {string|null}
     */
    getUrlPreview: function () {
        return this._options.urlPreview;
    },


    /**
     * Получение urlDownload
     * @return {string|null}
     */
    getUrlDownload: function () {
        return this._options.urlDownload;
    },


    /**
     * Получение size
     * @return {int|null}
     */
    getSize: function () {

        return this._fileData
            ? fileUpUtils.getFileSize(this._fileData)
            : this._options.size;
    },


    /**
     * Formatting size
     * @returns {string}
     */
    getSizeHuman: function() {

        let size = this.getSize();

        return fileUpUtils.getSizeHuman(size);
    },


    /**
     * Получение xhr
     * @return {XMLHttpRequest|null}
     */
    getXhr: function () {
        return this._xhr;
    },


    /**
     * Получение файла
     * @return {File|null}
     */
    getFileData: function () {

        if ( ! (this._fileData instanceof File)) {
            return null;
        }

        return this._fileData;
    },


    /**
     * Получение статуса
     * @return {string}
     */
    getStatus: function () {
        return this._status;
    },



    /**
     * Установка статуса
     * @param {string} status
     */
    setStatus: function (status) {

        if (typeof status !== 'string') {
            return;
        }

        this._status = status;
    },


    /**
     * Показ сообщения об ошибке
     * @param {string} message
     */
    showError: function (message) {

        if (typeof message !== 'string') {
            return;
        }

        let element = this.getElement();

        if (element) {
            element.find('.fileup-result')
                .removeClass('fileup-success')
                .addClass('fileup-error')
                .text(message);
        }
    },


    /**
     * Показ сообщения об успехе
     * @param {string} message
     */
    showSuccess: function (message) {

        if (typeof message !== 'string') {
            return;
        }

        let element = this.getElement();

        if (element) {
            element.find('.fileup-result')
                .removeClass('fileup-error')
                .addClass('fileup-success')
                .text(message);
        }
    },


    /**
     * Удаление файла на странице и из памяти
     */
    remove: function () {

        this.abort();

        if (this._fileElement) {
            this._fileElement.fadeOut('fast', function () {
                this.remove();
            });
        }

        let fileId = this.getId();

        if (this._fileUp._files.hasOwnProperty(fileId)) {
            delete this._fileUp._files[fileId];
        }

        fileUpPrivate.trigger(this._fileUp, 'remove', [this]);
    },


    /**
     * Загрузка файла
     * @return {boolean}
     */
    upload: function() {

        let fileData = this.getFileData();
        let xhr      = this.getXhr();

        if ( ! fileData || ! xhr) {
            return false;
        }


        let options = this._fileUp.getOptions();
        let that    = this;

        if (typeof options.timeout === 'number') {
            xhr.timeout = options.timeout;
        }

        // запрос начат
        xhr.onloadstart = function() {
            that.setStatus('load_start');
            fileUpPrivate.trigger(that._fileUp, 'load_start', [that]);
        };

        // браузер получил очередной пакет данных
        xhr.upload.onprogress = function(ProgressEvent) {
            fileUpPrivate.trigger(that._fileUp, 'load_progress', [that, ProgressEvent]);
        };

        // запрос был успешно (без ошибок) завершён
        xhr.onload = function() {
            that.setStatus('loaded');

            if (xhr.status === 200) {
                fileUpPrivate.trigger(that._fileUp, 'load_success', [that, xhr.responseText]);
            } else {
                fileUpPrivate.trigger(that._fileUp, 'error', [
                    'load_bad_status',
                    {
                        file: that,
                        fileData: fileData,
                        response: xhr.responseText,
                        xhr: xhr,
                    }
                ]);
            }
        };

        // запрос был завершён (успешно или неуспешно)
        xhr.onloadend = function() {
            that.setStatus('finish');
            fileUpPrivate.trigger(that._fileUp, 'load_finish', [that]);
        };

        // запрос был отменён вызовом xhr.abort()
        xhr.onabort = function() {
            that.setStatus('stand_by');
            fileUpPrivate.trigger(that._fileUp, 'load_abort', [that]);
        };

        // запрос был прекращён по таймауту
        xhr.ontimeout = function() {
            that.setStatus('stand_by');
            fileUpPrivate.trigger(that._fileUp, 'error', [
                'load_timeout',
                {
                    file: that,
                    fileData: fileData
                }
            ]);
        };

        // произошла ошибка
        xhr.onerror = function(event) {
            that.setStatus('stand_by');
            fileUpPrivate.trigger(that._fileUp, 'error', [
                'load_error',
                {
                    file: that,
                    fileData: fileData,
                    event: event
                }
            ]);
        };

        xhr.open(options.httpMethod || 'post', options.url, true);
        xhr.setRequestHeader('Cache-Control',    'no-cache');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');


        fileUpPrivate.trigger(that._fileUp, 'load_before_start', [that, xhr]);

        if (window.FormData !== undefined) {
            let formData = new FormData();
            formData.append(options.fieldName, fileData);

            if (Object.keys(options.extraFields).length) {
                $.each(options.extraFields, function(name, value){
                    formData.append(name, value);
                });
            }

            return xhr.send(formData);

        } else {
            // IE 8,9
            return xhr.send(fileData);
        }
    },


    /**
     * Отмена загрузки
     */
    abort: function() {

        if (this._xhr) {
            this._xhr.abort();
        }
    },


    /**
     * Рендер элемента
     * @param {string} tpl
     * @return {string|null}
     */
    render: function (tpl) {

        if ( ! tpl || typeof tpl !== 'string') {
            return null;
        }

        let lang        = this._fileUp.getLang();
        let options     = this._fileUp.getOptions();
        let that        = this;
        let isNoPreview = false;
        let mimeTypes   = fileUpUtils.isObject(options.mimeTypes) ? options.mimeTypes : {};
        let iconDefault = typeof options.iconDefault === 'string' ? options.iconDefault : '';
        let showClose   = typeof options.showClose === 'boolean' ? options.showClose : true;
        let size        = this.getSizeHuman();
        let icon        = null;

        let fileType = null;
        let fileExt  = null;

        tpl = tpl.replace(/\[ID\]/g,     this.getId());
        tpl = tpl.replace(/\[NAME\]/g,   this.getName());
        tpl = tpl.replace(/\[SIZE\]/g,   size);
        tpl = tpl.replace(/\[UPLOAD\]/g, lang.upload);
        tpl = tpl.replace(/\[REMOVE\]/g, lang.remove);
        tpl = tpl.replace(/\[ABORT\]/g,  lang.abort);

        if (this._fileData &&
            this._fileData instanceof File
        ) {
            if (this._fileData.type &&
                typeof this._fileData.type === 'string' &&
                this._fileData.type.match(/^image\/.*/)
            ) {
                if (typeof FileReader !== 'undefined') {
                    let reader = new FileReader();
                    reader.onload = function (ProgressEvent) {
                        if (that._fileElement) {
                            let preview = that._fileElement.find('.fileup-preview');

                            preview.removeClass('no-preview')
                                .find('img').attr('src', ProgressEvent.target.result)
                        }
                    };
                    reader.readAsDataURL(this._fileData);
                }

                isNoPreview = true;

                tpl = tpl.replace(/\[PREVIEW_SRC\]/g, '');
                tpl = tpl.replace(/\[TYPE\]/g,        'fileup-image fileup-no-preview');

            } else {
                tpl = tpl.replace(/\[PREVIEW_SRC\]/g, '');
                tpl = tpl.replace(/\[TYPE\]/g,        'fileup-doc');

                fileType = this._fileData.type;
                fileExt  = this.getName().split('.').pop();
            }

        } else {
            let urlPreview = this.getUrlPreview();

            tpl = tpl.replace(/\[PREVIEW_SRC\]/g, urlPreview ? urlPreview : '');
            tpl = tpl.replace(/\[TYPE\]/g,        urlPreview ? 'fileup-image' : 'fileup-doc');

            fileExt = this.getName() ? this.getName().split('.').pop() : '';
        }


        this._fileElement = $(tpl);

        if (isNoPreview) {
            this._fileElement.find('.fileup-preview').addClass('no-preview');
        }
        if ( ! size) {
            this._fileElement.find('.fileup-size').hide();
        }

        if (fileType || fileExt) {
            $.each(mimeTypes, function (name, type) {
                if ( ! fileUpUtils.isObject(type) ||
                    ! type.hasOwnProperty('icon') ||
                    typeof type.icon !== 'string' ||
                    type.icon === ''
                ) {
                    return;
                }

                if (fileType && type.hasOwnProperty('mime')) {
                    if (typeof type.mime === 'string') {
                        if (type.mime === fileType) {
                            icon = type.icon;
                            return false;
                        }

                    } else if (Array.isArray(type.mime)) {
                        $.each(type.mime, function (key, mime) {
                            if (typeof mime === 'string' && mime === fileType) {
                                icon = type.icon;
                                return false;
                            }
                        });

                        if (icon) {
                            return false;
                        }

                    } else if (type.mime instanceof RegExp) {
                        if (type.mime.test(fileType)) {
                            icon = type.icon;
                            return false;
                        }
                    }
                }

                if (fileExt && type.hasOwnProperty('ext') && Array.isArray(type.ext)) {
                    $.each(type.ext, function (key, ext) {
                        if (typeof ext === 'string' && ext === fileExt) {
                            icon = type.icon;
                            return false;
                        }
                    });

                    if (icon) {
                        return false;
                    }
                }
            });
        }

        if ( ! icon) {
            icon = iconDefault;
        }

        this._fileElement.find('.fileup-icon').addClass(icon);


        if ( ! showClose) {
            this._fileElement.find('.fileup-remove').hide();
        }

        if (this.getUrlDownload()) {
            let $name = this._fileElement.find('.fileup-name');
            if ($name[0]) {
                $name.replaceWith(
                    '<a href="' + this.getUrlDownload() + '" class="fileup-name" download="' + this.getName() + '">' +
                    this.getName() +
                    '</a>'
                );
            }
        }

        if (this._status === 'finish') {
            this._fileElement.find('.fileup-upload').hide();
            this._fileElement.find('.fileup-abort').hide();
            this._fileElement.find('.fileup-progress').hide();

        } else {
            this._fileElement.find('.fileup-upload').click(function () {
                that.upload();
            });

            this._fileElement.find('.fileup-abort').click(function () {
                that.abort();
            });
        }

        this._fileElement.find('.fileup-remove').click(function () {
            that.remove();
        });


        return this._fileElement;
    }
}

export default fileUpFile;