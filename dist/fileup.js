(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.fileUp = factory());
})(this, (function () { 'use strict';

  function _typeof(o) {
    "@babel/helpers - typeof";

    return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
      return typeof o;
    } : function (o) {
      return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
    }, _typeof(o);
  }

  var fileUpUtils = {
    /**
     * Проверка на объект
     * @param value
     */
    isObject: function isObject(value) {
      return _typeof(value) === 'object' && !Array.isArray(value) && value !== null;
    },
    /**
     * Проверка на число
     * @param num
     * @returns {boolean}
     * @private
     */
    isNumeric: function isNumeric(num) {
      return (typeof num === 'number' || typeof num === "string" && num.trim() !== '') && !isNaN(num);
    },
    /**
     * Получение размера файла в байтах
     * @param {File} file
     * @return {int|null}
     */
    getFileSize: function getFileSize(file) {
      if (!(file instanceof File)) {
        return null;
      }
      return file.size || file.fileSize;
    },
    /**
     * Получение названия файла
     * @param {File} file
     * @return {string|null}
     */
    getFileName: function getFileName(file) {
      if (!(file instanceof File)) {
        return null;
      }
      return file.name || file.fileName;
    },
    /**
     * Formatting size
     * @param {int} size
     * @returns {string}
     */
    getSizeHuman: function getSizeHuman(size) {
      if (!fileUpUtils.isNumeric(size)) {
        return '';
      }
      size = Number(size);
      var result = '';
      if (size >= 1073741824) {
        result = (size / 1073741824).toFixed(2) + ' Gb';
      } else if (size >= 1048576) {
        result = (size / 1048576).toFixed(2) + ' Mb';
      } else if (size >= 1024) {
        result = (size / 1024).toFixed(2) + ' Kb';
      } else if (size >= 0) {
        result = size + ' bytes';
      }
      return result;
    },
    /**
     * Создание уникальной строки хэша
     * @returns {string}
     * @private
     */
    hashCode: function hashCode() {
      return this.crc32((new Date().getTime() + Math.random()).toString()).toString(16);
    },
    /**
     * Hash crc32
     * @param str
     * @returns {number}
     * @private
     */
    crc32: function crc32(str) {
      for (var a, o = [], c = 0; c < 256; c++) {
        a = c;
        for (var f = 0; f < 8; f++) {
          a = 1 & a ? 3988292384 ^ a >>> 1 : a >>> 1;
        }
        o[c] = a;
      }
      for (var n = -1, t = 0; t < str.length; t++) {
        n = n >>> 8 ^ o[255 & (n ^ str.charCodeAt(t))];
      }
      return (-1 ^ n) >>> 0;
    }
  };

  var fileUpFile = {
    _options: {
      id: null,
      name: null,
      type: null,
      size: null,
      status: null,
      urlPreview: null,
      urlDownload: null
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
    _init: function _init(fileUp, options, fileData) {
      if (!fileUpUtils.isObject(options)) {
        throw new Error('File incorrect options param');
      }
      if (typeof options.id !== 'number' || options.id < 0) {
        throw new Error('File dont set or incorrect id param');
      }
      if (typeof options.name !== 'string' || !options.name) {
        throw new Error('File dont set name param');
      }
      this._fileUp = fileUp;
      this._options = $.extend(true, {}, this._options, options);
      this._id = this._options.id;
      this._status = typeof this._options.status === 'string' && this._options.status ? this._options.status : 'stand_by';
      if (fileData instanceof File) {
        var xhr = null;
        if (window.XMLHttpRequest) {
          xhr = "onload" in new XMLHttpRequest() ? new XMLHttpRequest() : new XDomainRequest();
        } else if (window.ActiveXObject) {
          try {
            xhr = new ActiveXObject("Msxml2.XMLHTTP");
          } catch (e) {
            try {
              xhr = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e) {
              fileUpPrivate.trigger(fileUp, 'error', ['old_browser', {
                file: this
              }]);
            }
          }
        } else {
          fileUpPrivate.trigger(fileUp, 'error', ['old_browser', {
            file: this
          }]);
        }
        if (!xhr) {
          throw new Error('xhr dont created. Check your browser');
        }
        this._xhr = xhr;
        this._fileData = fileData;
      } else {
        this._status = 'finish';
      }
    },
    /**
     * Получение id файла
     * @return {null}
     */
    getId: function getId() {
      return this._id;
    },
    /**
     * Получение name
     * @return {string|null}
     */
    getName: function getName() {
      return this._fileData ? fileUpUtils.getFileName(this._fileData) : this._options.name;
    },
    /**
     * Получение элемента файла
     * @return {jQuery|null}
     */
    getElement: function getElement() {
      return this._fileElement;
    },
    /**
     * Получение urlPreview
     * @return {string|null}
     */
    getUrlPreview: function getUrlPreview() {
      return this._options.urlPreview;
    },
    /**
     * Получение urlDownload
     * @return {string|null}
     */
    getUrlDownload: function getUrlDownload() {
      return this._options.urlDownload;
    },
    /**
     * Получение size
     * @return {int|null}
     */
    getSize: function getSize() {
      return this._fileData ? fileUpUtils.getFileSize(this._fileData) : this._options.size;
    },
    /**
     * Formatting size
     * @returns {string}
     */
    getSizeHuman: function getSizeHuman() {
      var size = this.getSize();
      return fileUpUtils.getSizeHuman(size);
    },
    /**
     * Получение xhr
     * @return {XMLHttpRequest|null}
     */
    getXhr: function getXhr() {
      return this._xhr;
    },
    /**
     * Получение файла
     * @return {File|null}
     */
    getFileData: function getFileData() {
      if (!(this._fileData instanceof File)) {
        return null;
      }
      return this._fileData;
    },
    /**
     * Получение статуса
     * @return {string}
     */
    getStatus: function getStatus() {
      return this._status;
    },
    /**
     * Установка статуса
     * @param {string} status
     */
    setStatus: function setStatus(status) {
      if (typeof status !== 'string') {
        return;
      }
      this._status = status;
    },
    /**
     * Удаление файла на странице и из памяти
     */
    remove: function remove() {
      this.abort();
      if (this._fileElement) {
        this._fileElement.fadeOut('fast', function () {
          this.remove();
        });
      }
      var fileId = this.getId();
      if (this._fileUp._files.hasOwnProperty(fileId)) {
        delete this._fileUp._files[fileId];
      }
      fileUpPrivate.trigger(this._fileUp, 'remove', [this]);
    },
    /**
     * Загрузка файла
     * @return {boolean}
     */
    upload: function upload() {
      var fileData = this.getFileData();
      var xhr = this.getXhr();
      if (!fileData || !xhr) {
        return false;
      }
      var options = this._fileUp.getOptions();
      var that = this;
      if (typeof options.timeout === 'number') {
        xhr.timeout = options.timeout;
      }

      // запрос начат
      xhr.onloadstart = function () {
        that.setStatus('load_start');
        fileUpPrivate.trigger(that._fileUp, 'load_start', [that]);
      };

      // браузер получил очередной пакет данных
      xhr.upload.onprogress = function (ProgressEvent) {
        fileUpPrivate.trigger(that._fileUp, 'load_progress', [that, ProgressEvent]);
      };

      // запрос был успешно (без ошибок) завершён
      xhr.onload = function () {
        that.setStatus('loaded');
        if (xhr.status === 200) {
          fileUpPrivate.trigger(that._fileUp, 'load_success', [that, xhr.responseText]);
        } else {
          fileUpPrivate.trigger(that._fileUp, 'error', ['load_bad_status', {
            file: that,
            fileData: fileData,
            response: xhr.responseText,
            xhr: xhr
          }]);
        }
      };

      // запрос был завершён (успешно или неуспешно)
      xhr.onloadend = function () {
        that.setStatus('finish');
        fileUpPrivate.trigger(that._fileUp, 'load_finish', [that]);
      };

      // запрос был отменён вызовом xhr.abort()
      xhr.onabort = function () {
        that.setStatus('stand_by');
        fileUpPrivate.trigger(that._fileUp, 'load_abort', [that]);
      };

      // запрос был прекращён по таймауту
      xhr.ontimeout = function () {
        that.setStatus('stand_by');
        fileUpPrivate.trigger(that._fileUp, 'error', ['load_timeout', {
          file: that,
          fileData: fileData
        }]);
      };

      // произошла ошибка
      xhr.onerror = function (event) {
        that.setStatus('stand_by');
        fileUpPrivate.trigger(that._fileUp, 'error', ['load_error', {
          file: that,
          fileData: fileData,
          event: event
        }]);
      };
      xhr.open(options.httpMethod || 'post', options.url, true);
      xhr.setRequestHeader('Cache-Control', 'no-cache');
      xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
      fileUpPrivate.trigger(that._fileUp, 'load_before_start', [that, xhr]);
      if (window.FormData !== undefined) {
        var formData = new FormData();
        formData.append(options.fieldName, fileData);
        if (Object.keys(options.extraFields).length) {
          $.each(options.extraFields, function (name, value) {
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
    abort: function abort() {
      if (this._xhr) {
        this._xhr.abort();
      }
    },
    /**
     * Рендер элемента
     * @param {string} tpl
     * @return {string|null}
     */
    render: function render(tpl) {
      if (!tpl || typeof tpl !== 'string') {
        return null;
      }
      var lang = this._fileUp.getLang();
      var options = this._fileUp.getOptions();
      var that = this;
      var isNoPreview = false;
      var mimeTypes = fileUpUtils.isObject(options.mimeTypes) ? options.mimeTypes : {};
      var iconDefault = typeof options.iconDefault === 'string' ? options.iconDefault : '';
      var size = this.getSizeHuman();
      var icon = null;
      var fileType = null;
      var fileExt = null;
      tpl = tpl.replace(/\[ID\]/g, this.getId());
      tpl = tpl.replace(/\[NAME\]/g, this.getName());
      tpl = tpl.replace(/\[SIZE\]/g, size);
      tpl = tpl.replace(/\[UPLOAD\]/g, lang.upload);
      tpl = tpl.replace(/\[REMOVE\]/g, lang.remove);
      tpl = tpl.replace(/\[ABORT\]/g, lang.abort);
      if (this._fileData && this._fileData instanceof File) {
        if (this._fileData.type && typeof this._fileData.type === 'string' && this._fileData.type.match(/^image\/.*/)) {
          if (typeof FileReader !== 'undefined') {
            var reader = new FileReader();
            reader.onload = function (ProgressEvent) {
              if (that._fileElement) {
                var preview = that._fileElement.find('.fileup-preview');
                preview.removeClass('no-preview').find('img').attr('src', ProgressEvent.target.result);
              }
            };
            reader.readAsDataURL(this._fileData);
          }
          isNoPreview = true;
          tpl = tpl.replace(/\[PREVIEW_SRC\]/g, '');
          tpl = tpl.replace(/\[TYPE\]/g, 'fileup-image fileup-no-preview');
        } else {
          tpl = tpl.replace(/\[PREVIEW_SRC\]/g, '');
          tpl = tpl.replace(/\[TYPE\]/g, 'fileup-doc');
          fileType = this._fileData.type;
          fileExt = this.getName().split('.').pop();
        }
      } else {
        var urlPreview = this.getUrlPreview();
        tpl = tpl.replace(/\[PREVIEW_SRC\]/g, urlPreview ? urlPreview : '');
        tpl = tpl.replace(/\[TYPE\]/g, urlPreview ? 'fileup-image' : 'fileup-doc');
        fileExt = this.getName() ? this.getName().split('.').pop() : '';
      }
      this._fileElement = $(tpl);
      if (isNoPreview) {
        this._fileElement.find('.fileup-preview').addClass('no-preview');
      }
      if (!size) {
        this._fileElement.find('.fileup-size').hide();
      }
      if (fileType || fileExt) {
        $.each(mimeTypes, function (name, type) {
          if (!fileUpUtils.isObject(type) || !type.hasOwnProperty('icon') || typeof type.icon !== 'string' || type.icon === '') {
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
      if (!icon) {
        icon = iconDefault;
      }
      this._fileElement.find('.fileup-icon').addClass(icon);
      if (this.getUrlDownload()) {
        var $name = this._fileElement.find('.fileup-name');
        if ($name[0]) {
          $name.replaceWith('<a href="' + this.getUrlDownload() + '" class="fileup-name" download="' + this.getName() + '">' + this.getName() + '</a>');
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
  };

  var fileUpEvents = {
    /**
     * Событие начала загрузки
     * @param {object} file
     */
    onLoadStart: function onLoadStart(file) {
      var $file = file.getElement();
      if ($file) {
        $file.find('.fileup-upload').hide();
        $file.find('.fileup-abort').show();
        $file.find('.fileup-result').removeClass('fileup-error').removeClass('fileup-success').text('');
      }
    },
    /**
     * Событие начала изменения прогресса загрузки
     * @param {object}        file
     * @param {ProgressEvent} ProgressEvent
     */
    onLoadProgress: function onLoadProgress(file, ProgressEvent) {
      if (ProgressEvent.lengthComputable) {
        var percent = Math.ceil(ProgressEvent.loaded / ProgressEvent.total * 100);
        var $file = file.getElement();
        if ($file) {
          $file.find('.fileup-progress-bar').css('width', percent + "%");
        }
      }
    },
    /**
     * Событие начала загрузки
     * @param {object} file
     */
    onLoadAbort: function onLoadAbort(file) {
      var $file = file.getElement();
      if ($file) {
        $file.find('.fileup-abort').hide();
        $file.find('.fileup-upload').show();
        $file.find('.fileup-result').removeClass('fileup-error').removeClass('fileup-success').text('');
      }
    },
    /**
     * Событие успешной загрузки файла
     * @param {object} file
     */
    onSuccess: function onSuccess(file) {
      var $file = file.getElement();
      if ($file) {
        var lang = this.getLang();
        $file.find('.fileup-abort').hide();
        $file.find('.fileup-upload').hide();
        $file.find('.fileup-result').removeClass('fileup-error').addClass('fileup-success').text(lang.complete);
      }
    },
    /**
     * Событие ошибки
     * @param {string} eventName
     * @param {object} options
     */
    onError: function onError(eventName, options) {
      var lang = this.getLang();
      switch (eventName) {
        case 'files_limit':
          alert(lang.errorFilesLimit.replace(/%filesLimit%/g, options.filesLimit));
          break;
        case 'size_limit':
          var size = fileUpUtils.getSizeHuman(options.sizeLimit);
          var message = lang.errorSizeLimit;
          message = message.replace(/%sizeLimit%/g, size);
          message = message.replace(/%fileName%/g, fileUpUtils.getFileName(options.fileData));
          alert(message);
          break;
        case 'file_type':
          alert(lang.errorFileType.replace(/%fileName%/g, fileUpUtils.getFileName(options.fileData)));
          break;
        case 'load_bad_status':
        case 'load_error':
        case 'load_timeout':
          var $file = options.file.getElement();
          if ($file) {
            var _message = eventName === 'load_bad_status' ? lang.errorBadStatus : lang.errorLoad;
            $file.find('.fileup-abort').hide();
            $file.find('.fileup-upload').show();
            $file.find('.fileup-result').addClass('fileup-error').text(_message);
          }
          break;
        case 'old_browser':
          alert(lang.errorOldBrowser);
          break;
      }
    },
    /**
     * Событие переноса файла через dropzone
     * @param {Event} event
     */
    onDragOver: function onDragOver(event) {
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
      var dropzone = this.getDropzone();
      if (dropzone) {
        dropzone.addClass('over');
      }
    },
    /**
     * Событие завершения перетаскивания с отпускаем кнопки мыши
     * @param {Event} event
     */
    onDragLeave: function onDragLeave(event) {
      var dropzone = this.getDropzone();
      if (dropzone) {
        dropzone.removeClass('over');
      }
    },
    /**
     * Событие когда перетаскиваемый элемент или выделенный текст покидают допустимую цель перетаскивания
     * @param {Event} event
     */
    onDragEnd: function onDragEnd(event) {
      var dropzone = this.getDropzone();
      if (dropzone) {
        dropzone.removeClass('over');
      }
    },
    /**
     * Событие переноса файла в dropzone
     * @param {Event} event
     */
    onDragEnter: function onDragEnter(event) {
      event.stopPropagation();
      event.preventDefault();
      event.dataTransfer.dropEffect = 'copy';
    }
  };

  var fileUpPrivate = {
    /**
     *
     * @param {object} fileUp
     */
    initInput: function initInput(fileUp) {
      var input = null;
      if (fileUp._options.input instanceof HTMLElement || fileUp._options.input instanceof jQuery) {
        input = $(fileUp._options.input);
      } else if (typeof fileUp._options.input === 'string' && fileUp._options.input) {
        input = $('#' + fileUp._options.input);
      }
      if (!input || !$(input)[0] || $(input)[0].type !== 'file') {
        throw new Error('Not found input element');
      }
      fileUp._input = input;
    },
    /**
     *
     * @param {object} fileUp
     */
    initQueue: function initQueue(fileUp) {
      var queue = null;
      if (fileUp._options.queue instanceof HTMLElement || fileUp._options.queue instanceof jQuery) {
        queue = $(fileUp._options.queue);
      } else if (typeof fileUp._options.queue === 'string' && fileUp._options.queue) {
        queue = $('#' + fileUp._options.queue);
      }
      if (!queue || !$(queue)[0]) {
        throw new Error('Not found queue element');
      }
      fileUp._queue = queue;
    },
    /**
     *
     * @param {object} fileUp
     */
    initDropzone: function initDropzone(fileUp) {
      var dropzone = null;
      if (fileUp._options.dropzone instanceof HTMLElement || fileUp._options.dropzone instanceof jQuery) {
        dropzone = $(fileUp._options.dropzone);
      } else if (typeof fileUp._options.dropzone === 'string' && fileUp._options.dropzone) {
        dropzone = $('#' + fileUp._options.dropzone);
      }
      if (dropzone) {
        fileUp._dropzone = dropzone;
        var that = this;
        dropzone.on('click', function () {
          fileUp.getInput().click();
        });
        dropzone[0].addEventListener('dragover', function (event) {
          that.trigger(fileUp, 'dragOver', [event]);
        });
        dropzone[0].addEventListener('dragleave', function (event) {
          that.trigger(fileUp, 'dragLeave', [event]);
        });
        dropzone[0].addEventListener('dragenter', function (event) {
          that.trigger(fileUp, 'dragEnter', [event]);
        });
        dropzone[0].addEventListener('dragend', function (event) {
          that.trigger(fileUp, 'dragEnd', [event]);
        });
        dropzone[0].addEventListener('drop', function (event) {
          fileUp.getInput()[0].files = event.target.files || event.dataTransfer.files;
          that.appendFiles(fileUp, event);
        });
      }
    },
    /**
     * Инициализация событий
     * @param {object} fileUp
     */
    initEvents: function initEvents(fileUp) {
      /**
       * @param {string}          name
       * @param {function|string} func
       */
      function setEvent(name, func) {
        var event = null;
        if (typeof func === 'function') {
          event = func;
        } else if (typeof func === 'string') {
          event = new Function(func);
        }
        if (event) {
          fileUp.on(name, event);
        }
      }
      var options = fileUp.getOptions();
      var that = this;
      setEvent('load_start', fileUpEvents.onLoadStart);
      setEvent('load_progress', fileUpEvents.onLoadProgress);
      setEvent('load_abort', fileUpEvents.onLoadAbort);
      setEvent('load_success', fileUpEvents.onSuccess);
      setEvent('error', fileUpEvents.onError);
      setEvent('dragOver', fileUpEvents.onDragOver);
      setEvent('dragEnter', fileUpEvents.onDragEnter);
      setEvent('dragLeave', fileUpEvents.onDragLeave);
      setEvent('dragEnd', fileUpEvents.onDragEnd);
      if (options.onSelect) {
        setEvent('select', options.onSelect);
      }
      if (options.onRemove) {
        setEvent('remove', options.onRemove);
      }
      if (options.onBeforeStart) {
        setEvent('load_before_start', options.onBeforeStart);
      }
      if (options.onStart) {
        setEvent('load_start', options.onStart);
      }
      if (options.onProgress) {
        setEvent('load_progress', options.onProgress);
      }
      if (options.onAbort) {
        setEvent('load_abort', options.onAbort);
      }
      if (options.onSuccess) {
        setEvent('load_success', options.onSuccess);
      }
      if (options.onFinish) {
        setEvent('load_finish', options.onFinish);
      }
      if (options.onError) {
        setEvent('error', options.onError);
      }
      if (options.onDragOver) {
        setEvent('dragOver', options.onDragOver);
      }
      if (options.onDragLeave) {
        setEvent('dragLeave', options.onDragLeave);
      }
      if (options.onDragEnd) {
        setEvent('dragEnd', options.onDragEnd);
      }
      if (options.onDragEnter) {
        setEvent('dragEnter', options.onDragEnter);
      }
      fileUp.getInput().on('change', function (event) {
        that.appendFiles(fileUp, event);
      });
    },
    /**
     * Формирование списка ранее загруженных файлов
     * @param {object} fileUp
     */
    renderFiles: function renderFiles(fileUp) {
      var options = fileUp.getOptions();
      if (Array.isArray(options.files) && options.files.length > 0) {
        for (var i = 0; i < options.files.length; i++) {
          if (!fileUpUtils.isObject(options.files[i])) {
            continue;
          }
          options.files[i].id = fileUp._fileIndex;
          options.files[i].status = 'loaded';
          this.appendFileByData(fileUp, options.files[i]);
        }
      }
    },
    /**
     * @param fileUp
     * @param name
     * @param params
     * @return {object}
     * @private
     */
    trigger: function trigger(fileUp, name, params) {
      params = params || [];
      var results = [];
      if (fileUp._events[name] instanceof Object && fileUp._events[name].length > 0) {
        for (var i = 0; i < fileUp._events[name].length; i++) {
          var callback = fileUp._events[name][i].callback;
          results.push(callback.apply(fileUp._events[name][i].context || fileUp, params));
          if (fileUp._events[name][i].singleExec) {
            fileUp._events[name].splice(i, 1);
            i--;
          }
        }
      }
      return results;
    },
    /**
     * Append files in queue
     * @param {object} fileUp
     * @param {Event}  event
     */
    appendFiles: function appendFiles(fileUp, event) {
      var _this = this;
      event.preventDefault();
      event.stopPropagation();
      var options = fileUp.getOptions();
      var input = fileUp.getInput();
      var files = input[0].files;
      var multiple = input.is("[multiple]");
      if (files.length > 0) {
        var _loop = function _loop() {
            var file = files[i];
            if (options.sizeLimit > 0 && fileUpUtils.getFileSize(file) > options.sizeLimit) {
              _this.trigger(fileUp, 'error', ['size_limit', {
                fileData: file,
                sizeLimit: options.sizeLimit
              }]);
              return 0; // continue
            }
            if (options.filesLimit > 0 && Object.keys(fileUp._files).length >= options.filesLimit) {
              _this.trigger(fileUp, 'error', ['files_limit', {
                fileData: file,
                filesLimit: options.filesLimit
              }]);
              return 1; // break
            }
            if (typeof input[0].accept === 'string') {
              var accept = input[0].accept;
              if (accept && /[^\w]+/.test(accept)) {
                var isAccept = false;
                var types = accept.split(',');
                if (types.length > 0) {
                  for (t = 0; t < types.length; t++) {
                    types[t] = types[t].replace(/\s/g, '');
                    if (new RegExp(types[t].replace('*', '.*')).test(file.type) || new RegExp(types[t].replace('.', '.*/')).test(file.type)) {
                      isAccept = true;
                      break;
                    }
                  }
                }
                if (!isAccept) {
                  _this.trigger(fileUp, 'error', ['file_type', {
                    fileData: file
                  }]);
                  return 0; // continue
                }
              }
            }
            var results = _this.trigger(fileUp, 'select', [file]);
            if (results) {
              var isContinue = false;
              $.each(results, function (key, result) {
                if (result === false) {
                  isContinue = true;
                  return false;
                }
              });
              if (isContinue) {
                return 0; // continue
              }
            }
            if (!multiple) {
              fileUp.removeAll();
            }
            _this.appendFile(fileUp, file);
            if (!multiple) {
              return 1; // break
            }
          },
          t,
          _ret;
        for (var i = 0; i < files.length; i++) {
          _ret = _loop();
          if (_ret === 0) continue;
          if (_ret === 1) break;
        }
        input.val('');
      }
      this.trigger(fileUp, 'dragEnd', [event]);
    },
    /**
     * Добавление файла в список из объекта File
     * @param {object} fileUp
     * @param {object} file
     */
    appendFile: function appendFile(fileUp, file) {
      var options = fileUp.getOptions();
      var fileInstance = $.extend(true, {}, fileUpFile);
      var data = {
        id: fileUp._fileIndex,
        name: fileUpUtils.getFileName(file),
        size: fileUpUtils.getFileSize(file),
        type: file.type
      };
      fileInstance._init(fileUp, data, file);
      fileUp._files[fileUp._fileIndex] = fileInstance;
      var queue = fileUp.getQueue();
      if (queue) {
        queue.append(fileInstance.render(options.templateFile));
      }
      fileUp._fileIndex++;
      if (typeof fileUp._options.autostart === 'boolean' && fileUp._options.autostart) {
        fileInstance.upload();
      }
    },
    /**
     * Добавление файла в список из данных
     * @param {object} fileUp
     * @param {object} data
     */
    appendFileByData: function appendFileByData(fileUp, data) {
      var options = fileUp.getOptions();
      var fileInstance = $.extend(true, {}, fileUpFile);
      fileInstance._init(fileUp, data);
      fileUp._files[fileUp._fileIndex] = fileInstance;
      var queue = fileUp.getQueue();
      if (queue) {
        queue.append(fileInstance.render(options.templateFile));
      }
      fileUp._fileIndex++;
    }
  };

  var tpl = Object.create(null);
  tpl['file.html'] = '<div class="fileup-file [TYPE] mb-2 p-1 d-flex flex-nowrap gap-2 bg-light border border-secondary-subtle rounded rounded-1"> <div class="fileup-preview"> <img src="[PREVIEW_SRC]" alt="[NAME]" class="border rounded"/> <i class="fileup-icon fs-4 text-secondary"></i> </div> <div class="flex-fill"> <div class="fileup-description"> <span class="fileup-name">[NAME]</span> <small class="fileup-size text-nowrap text-secondary">([SIZE])</small> </div> <div class="fileup-controls mt-1 d-flex gap-2"> <span class="fileup-remove" title="[REMOVE]">✕</span> <span class="fileup-upload link-primary">[UPLOAD]</span> <span class="fileup-abort link-primary" style="display:none">[ABORT]</span> </div> <div class="fileup-result"></div> <div class="fileup-progress progress mt-2 mb-1"> <div class="fileup-progress-bar progress-bar"></div> </div> </div> </div>';

  var fileUpInstance = {
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
    _init: function _init(options) {
      if (typeof options.url !== 'string' || !options.url) {
        throw new Error('Dont set url param');
      }
      this._options = $.extend(true, {}, this._options, options);
      this._id = typeof this._options.id === 'string' && this._options.id ? this._options.id : fileUpUtils.hashCode();
      if (!this._options.templateFile || typeof this._options.templateFile !== 'string') {
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
    getOptions: function getOptions() {
      return this._options;
    },
    /**
     * Получение id
     * @return {string|null}
     */
    getId: function getId() {
      return this._id;
    },
    /**
     * Получение input
     * @return {jQuery|null}
     */
    getInput: function getInput() {
      return this._input;
    },
    /**
     * Получение queue
     * @return {jQuery|null}
     */
    getQueue: function getQueue() {
      return this._queue;
    },
    /**
     * Получение dropzone
     * @return {jQuery|null}
     */
    getDropzone: function getDropzone() {
      return this._dropzone;
    },
    /**
     * Подписка на событие
     * @param {string}           eventName
     * @param {function|string}  callback
     * @param {object|undefined} context
     */
    on: function on(eventName, callback, context) {
      if (_typeof(this._events[eventName]) !== 'object') {
        this._events[eventName] = [];
      }
      this._events[eventName].push({
        context: context || this,
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
    one: function one(eventName, callback, context) {
      if (_typeof(this._events[eventName]) !== 'object') {
        this._events[eventName] = [];
      }
      this._events[eventName].push({
        context: context || this,
        callback: callback,
        singleExec: true
      });
    },
    /**
     * Получение настроек языка
     */
    getLang: function getLang() {
      return $.extend(true, {}, this._options.langItems);
    },
    /**
     * Получение всех файлов
     * @return {object}
     */
    getFiles: function getFiles() {
      return this._files;
    },
    /**
     * Получение файла по его id
     * @param {int} fileId
     * @return {object|null}
     */
    getFileById: function getFileById(fileId) {
      var result = null;
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
    removeAll: function removeAll() {
      $.each(this._files, function (key, file) {
        file.remove();
      });
    },
    /**
     * Загрузка всех файлов
     */
    uploadAll: function uploadAll() {
      $.each(this._files, function (key, file) {
        file.upload();
      });
    },
    /**
     * Отмена загрузки всех файлов
     */
    abortAll: function abortAll() {
      $.each(this._files, function (key, file) {
        file.abort();
      });
    }
  };

  var fileUp = {
    lang: {},
    _instances: {},
    /**
     * Создание экземпляра
     * @param {object} options
     * @returns {object}
     */
    create: function create(options) {
      options = fileUpUtils.isObject(options) ? options : {};
      if (!options.hasOwnProperty('lang')) {
        options.lang = 'en';
      }
      var langList = this.lang.hasOwnProperty(options.lang) ? this.lang[options.lang] : {};
      options.langItems = options.hasOwnProperty('langItems') && fileUpUtils.isObject(options.langItems) ? $.extend(true, {}, langList, options.langItems) : langList;
      var instance = $.extend(true, {}, fileUpInstance);
      instance._init(options);
      var id = instance.getId();
      this._instances[id] = instance;
      return instance;
    },
    /**
     * Получение экземпляра по id
     * @param {string} id
     * @returns {object|null}
     */
    get: function get(id) {
      if (!this._instances.hasOwnProperty(id)) {
        return null;
      }
      if (!$.contains(document, this._instances[id]._input[0])) {
        delete this._instances[id];
        return null;
      }
      return this._instances[id];
    }
  };

  fileUp.lang.en = {
    upload: 'Upload',
    abort: 'Abort',
    remove: 'Remove',
    complete: 'Complete',
    error: 'Error',
    errorLoad: 'Error uploading file',
    errorBadStatus: 'Error uploading file. Bad request.',
    errorFilesLimit: 'The number of selected files exceeds the limit (%filesLimit%)',
    errorSizeLimit: 'File "%fileName%" exceeds the size limit (%sizeLimit%)',
    errorFileType: 'File "%fileName%" is incorrect',
    errorOldBrowser: 'Your browser can not upload files. Update to the latest version'
  };

  fileUp.lang.ru = {
    upload: 'Загрузить',
    abort: 'Остановить',
    remove: 'Удалить',
    complete: 'Готово',
    error: 'Ошибка',
    errorLoad: 'Ошибка при загрузке файла',
    errorBadStatus: 'Ошибка при загрузке файла. Некорректный запрос.',
    errorFilesLimit: 'Количество выбранных файлов превышает лимит (%filesLimit%)',
    errorSizeLimit: 'Файл "%fileName%" превышает предельный размер (%sizeLimit%)',
    errorFileType: 'Файл "%fileName%" является некорректным',
    errorOldBrowser: 'Обновите ваш браузер до последней версии'
  };

  fileUp.lang.es = {
    upload: 'Subir',
    abort: 'Cancelar',
    remove: 'Eliminar',
    complete: 'Cargado',
    error: 'Error',
    errorLoad: 'Error al cargar el archivo',
    errorBadStatus: 'Error al cargar el archivo. Solicitud no válida.',
    errorFilesLimit: 'El número de archivo selecccionados excede el límite (%filesLimit%)',
    errorSizeLimit: 'El archivo "%fileName%" excede el limite de tamaño (%sizeLimit%)',
    errorFileType: 'El archivo "%fileName%" es inválido',
    errorOldBrowser: 'Tu navegador no puede subir archivos. Actualiza a la última versión'
  };

  fileUp.lang.pt = {
    upload: 'Enviar',
    abort: 'Cancelar',
    remove: 'Remover',
    complete: 'Enviado',
    error: 'Erro',
    errorLoad: 'Erro ao carregar o arquivo',
    errorBadStatus: 'Erro ao carregar o arquivo. Pedido inválido.',
    errorFilesLimit: 'O número de arquivos selecionados excede o limite (%filesLimit%)',
    errorSizeLimit: 'Arquivo "%fileName%" excede o limite (%sizeLimit%)',
    errorFileType: 'Arquivo "%fileName%" inválido',
    errorOldBrowser: 'Seu navegador não pode enviar os arquivos. Atualize para a versão mais recente'
  };

  return fileUp;

}));
