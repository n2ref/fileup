(function($){
    var default_options = {
        url: window.location.pathname + window.location.search,
        inputID: '',
        queueID: '',
        dropzoneID: '',
        files: [],
        fieldName: 'filedata',
        extraFields: {},
        lang: 'en',
        sizeLimit: 0,
        filesLimit: 0,
        method: 'post',
        timeout: null,
        autostart: false,
        templateFile: '<div id="fileup-[INPUT_ID]-[FILE_NUM]" class="fileup-file [TYPE]">' +
            '<div class="fileup-preview">' +
            '<img src="[PREVIEW_SRC]" alt="[NAME]"/>' +
            '</div>' +
            '<div class="fileup-container">' +
            '<div class="fileup-description">' +
            '<span class="fileup-name">[NAME]</span> (<span class="fileup-size">[SIZE_HUMAN]</span>)' +
            '</div>' +
            '<div class="fileup-controls">' +
            '<span class="fileup-remove" onclick="$.fileup(\'[INPUT_ID]\', \'remove\', \'[FILE_NUM]\');" title="[REMOVE]"></span>' +
            '<span class="fileup-upload" onclick="$.fileup(\'[INPUT_ID]\', \'upload\', \'[FILE_NUM]\');">[UPLOAD]</span>' +
            '<span class="fileup-abort" onclick="$.fileup(\'[INPUT_ID]\', \'abort\', \'[FILE_NUM]\');" style="display:none">[ABORT]</span>' +
            '</div>' +
            '<div class="fileup-result"></div>' +
            '<div class="fileup-progress">' +
            '<div class="fileup-progress-bar"></div>' +
            '</div>' +
            '</div>' +
            '<div class="fileup-clear"></div>' +
            '</div>',
        onSelect: function(file) {},
        onRemove: function(file_number, total, file) {},
        onBeforeStart: function(file_number, xhr, file) {},
        onBeforeRender: function() {},
        onAfterRender: function() {},
        onStart: function(file_number, file) {},
        onStartSystem: function(file_number, file) {
            var options = this.fileup.options;
            var $file   = $('#fileup-' + options.inputID + '-' + file_number);
            $file.find('.fileup-controls .fileup-upload').hide();
            $file.find('.fileup-controls .fileup-abort').show();
            $file.find('.fileup-result')
                .removeClass('fileup-error')
                .removeClass('fileup-success')
                .text('');
        },
        onProgress: function(file_number, ProgressEvent, file) {
            if (ProgressEvent.lengthComputable) {
                var options = this.fileup.options;
                var percent = Math.ceil(ProgressEvent.loaded / ProgressEvent.total * 100);
                $('#fileup-' + options.inputID + '-' + file_number + ' .fileup-progress-bar').css('width', percent + "%");
            }
        },
        onSuccess: function(file_number, response, file) {},
        onError: function(event, file, file_number, response) {},
        onErrorSystem: function(event, file, file_number) {
            var options = this.fileup.options;
            switch(event) {
                case 'files_limit':
                    var message = i18n[options.lang].errorFilesLimit;
                    alert(message.replace(/%filesLimit%/g, options.filesLimit));
                    break;
                case 'size_limit':
                    var size    = formatHuman(options.sizeLimit);
                    var message = i18n[options.lang].errorSizeLimit;
                    message = message.replace(/%sizeLimit%/g, size);
                    message = message.replace(/%fileName%/g, file.name);
                    alert(message);
                    break;
                case 'file_type':
                    var message = i18n[options.lang].errorFileType;
                    alert(message.replace(/%fileName%/g, file.name));
                    break;
                case 'bad_status':
                case 'error_load':
                    var $file = $('#fileup-' + options.inputID + '-' + file_number);
                    $file.find('.fileup-controls .fileup-abort').hide();
                    $file.find('.fileup-controls .fileup-upload').show();
                    $file.find('.fileup-result')
                        .addClass('fileup-error')
                        .text(i18n[options.lang].error);
                    break;
                case 'old_browser':
                    alert(i18n[options.lang].errorOldBrowser);
                    break;
            }
        },
        onAbort: function(file_number, file) {},
        onAbortSystem: function(file_number, file) {
            var options = this.fileup.options;
            var $file   = $('#fileup-' + options.inputID + '-' + file_number);
            $file.find('.fileup-controls .fileup-abort').hide();
            $file.find('.fileup-controls .fileup-upload').show();
            $file.find('.fileup-result')
                .removeClass('fileup-error')
                .removeClass('fileup-success')
                .text('');
        },
        onTimeout: function(file_number, file) {},
        onTimeoutSystem: function(file_number, file) {
            var options = this.fileup.options;
            var $file   = $('#fileup-' + options.inputID + '-' + file_number);
            $file.find('.fileup-controls .fileup-abort').hide();
            $file.find('.fileup-controls .fileup-upload').show();
            $file.find('.fileup-result')
                .removeClass('fileup-error')
                .removeClass('fileup-success')
                .text('');
        },
        onFinish: function(file_number, file) {},
        onSuccessSystem: function(response, file_number, file) {
            var options = this.fileup.options;
            var $file   = $('#fileup-' + options.inputID + '-' + file_number);
            $file.find('.fileup-controls .fileup-abort').hide();
            $file.find('.fileup-controls .fileup-upload').hide();
            $file.find('.fileup-result')
                .removeClass('fileup-error')
                .addClass('fileup-success')
                .text(i18n[options.lang].complete);
        },
        onDragOver: function(event) {
            event.stopPropagation();
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        },
        onDragLeave: function(event) {},
        onDragEnd: function(event) {},
        onDragEnter: function(event) {
            event.stopPropagation();
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        }
    };


    var events = {
        addEvent : function(input, name, callback) {
            var stack = input.fileup.events[name] || [];
            stack.push(callback);
            input.fileup.events[name] = stack;
        },
        removeEvents : function(input, name) {
            input.fileup.events[name] = [];
        },
        callEvent : function(input, name, args) {
            var result = true,
                event_result;

            if (input.fileup.events[name]) {
                for (var i = 0; i < input.fileup.events[name].length; i++) {
                    if (typeof input.fileup.events[name][i] === 'function') {
                        if (args) {
                            event_result = input.fileup.events[name][i].apply(input, args);
                            if (result && event_result === false) {
                                result = false;
                            }
                        } else {
                            event_result = input.fileup.events[name][i].apply(input);
                            if (result && event_result === false) {
                                result = false;
                            }
                        }

                    }
                }
            }

            return result;
        }
    };


    var eventRegister = {
        input :       {},
        select :      function(callback) {events.addEvent(eventRegister.input, 'select',      callback); return eventRegister;},
        remove :      function(callback) {events.addEvent(eventRegister.input, 'remove',      callback); return eventRegister;},
        beforeStart : function(callback) {events.addEvent(eventRegister.input, 'beforeStart', callback); return eventRegister;},
        start :       function(callback) {events.addEvent(eventRegister.input, 'start',       callback); return eventRegister;},
        progress :    function(callback) {events.addEvent(eventRegister.input, 'progress',    callback); return eventRegister;},
        success :     function(callback) {events.addEvent(eventRegister.input, 'success',     callback); return eventRegister;},
        error :       function(callback) {events.addEvent(eventRegister.input, 'error',       callback); return eventRegister;},
        abort :       function(callback) {events.addEvent(eventRegister.input, 'abort',       callback); return eventRegister;},
        timeout :     function(callback) {events.addEvent(eventRegister.input, 'timeout',     callback); return eventRegister;},
        dragOver :    function(callback) {events.addEvent(eventRegister.input, 'dragOver',    callback); return eventRegister;},
        dragLeave :   function(callback) {events.addEvent(eventRegister.input, 'dragLeave',   callback); return eventRegister;},
        dragEnd :     function(callback) {events.addEvent(eventRegister.input, 'dragEnd',     callback); return eventRegister;},
        dragEnter :   function(callback) {events.addEvent(eventRegister.input, 'dragEnter',   callback); return eventRegister;}
    };


    var i18n = {
        ru: {
            upload: 'Загрузить',
            abort: 'Остановить',
            remove: 'Удалить',
            complete: 'Готово',
            error: 'Ошибка',
            errorFilesLimit: 'Количество выбранных файлов превышает лимит (%filesLimit%)',
            errorSizeLimit: 'Файл "%fileName%" превышает предельный размер (%sizeLimit%)',
            errorFileType: 'Файл "%fileName%" является некорректным',
            errorOldBrowser: 'Ваш браузер не может загружать файлы. Обновите его до последней версии'
        },
        en: {
            upload: 'Upload',
            abort: 'Abort',
            remove: 'Remove',
            complete: 'Complete',
            error: 'Error',
            errorFilesLimit: 'The number of selected files exceeds the limit (%filesLimit%)',
            errorSizeLimit: 'File "%fileName%" exceeds the size limit (%sizeLimit%)',
            errorFileType: 'File "%fileName%" is incorrect',
            errorOldBrowser: 'Your browser can not upload files. Update to the latest version'
        }
    };


    /**
     * Init fileup
     * @param {object} param1
     */
    function init(param1) {

        var options = $.extend(false, default_options, param1);
        var input   = document.getElementById(options.inputID);

        if (input && input.type === 'file') {
            if (options.dropzoneID) {
                var dropZone = document.getElementById(options.dropzoneID);
                if (dropZone) {
                    dropZone.addEventListener('dragover',  function(event) {
                        events.callEvent(input, 'dragOver', [event]);
                    });
                    dropZone.addEventListener('dragleave', function(event) {
                        events.callEvent(input, 'dragLeave', [event]);
                    });
                    dropZone.addEventListener('dragenter', function(event) {
                        events.callEvent(input, 'dragEnter', [event]);
                    });
                    dropZone.addEventListener('drop',      dropFiles);
                    dropZone.fileup = {
                        input: input
                    };
                }
            }

            input.fileup = {
                files: {},
                nextID: 0,
                options: options,
                events: {}
            };

            events.addEvent(input, 'select',       options.onSelect);
            events.addEvent(input, 'remove',       options.onRemove);
            events.addEvent(input, 'beforeStart',  options.onBeforeStart);
            events.addEvent(input, 'beforeRender', options.onBeforeRender);
            events.addEvent(input, 'afterRender',  options.onAfterRender);
            events.addEvent(input, 'start',        options.onStartSystem);
            events.addEvent(input, 'start',        options.onStart);
            events.addEvent(input, 'progress',     options.onProgress);
            events.addEvent(input, 'success',      options.onSuccessSystem);
            events.addEvent(input, 'success',      options.onSuccess);
            events.addEvent(input, 'error',        options.onErrorSystem);
            events.addEvent(input, 'error',        options.onError);
            events.addEvent(input, 'abort',        options.onAbortSystem);
            events.addEvent(input, 'abort',        options.onAbort);
            events.addEvent(input, 'timeout',      options.onTimeoutSystem);
            events.addEvent(input, 'timeout',      options.onTimeout);
            events.addEvent(input, 'dragOver',     options.onDragOver);
            events.addEvent(input, 'dragLeave',    options.onDragLeave);
            events.addEvent(input, 'dragEnd',      options.onDragEnd);
            events.addEvent(input, 'dragEnter',    options.onDragEnter);

            $(input).on('change', appendFiles);


            if (options.files.length > 0) {
                events.callEvent(input, 'beforeRender');
                for (var i = 0; i < options.files.length; i++) {

                    var tpl = options.templateFile;
                    tpl = tpl.replace(/\[INPUT_ID\]/g,   options.inputID);
                    tpl = tpl.replace(/\[FILE_NUM\]/g,   input.fileup.nextID);
                    tpl = tpl.replace(/\[NAME\]/g,       options.files[i].name);
                    tpl = tpl.replace(/\[SIZE_HUMAN\]/g, formatHuman(options.files[i].size));
                    tpl = tpl.replace(/\[UPLOAD\]/g,     i18n[options.lang].upload);
                    tpl = tpl.replace(/\[REMOVE\]/g,     i18n[options.lang].remove);
                    tpl = tpl.replace(/\[ABORT\]/g,      i18n[options.lang].abort);

                    input.fileup.files[input.fileup.nextID] = {
                        xhr: null,
                        file: options.files[i],
                        file_number: input.fileup.nextID,
                        status: 'loaded'
                    };

                    if (options.files[i].previewUrl) {
                        tpl = tpl.replace(/\[PREVIEW_SRC\]/g, options.files[i].previewUrl);
                        tpl = tpl.replace(/\[TYPE\]/g,        'fileup-image');

                    } else {
                        tpl = tpl.replace(/\[PREVIEW_SRC\]/g, "");
                        tpl = tpl.replace(/\[TYPE\]/g,        'fileup-doc');
                    }

                    $('#' + options.queueID).append(tpl)
                        .find('.fileup-progress, .fileup-result, .fileup-upload, .fileup-abort').remove();


                    if (options.files[i].downloadUrl) {
                        var $name = $('#fileup-' + options.inputID + '-' + input.fileup.nextID).find('.fileup-name');
                        if ($name[0]) {
                            $name.replaceWith('<a href="' + options.files[i].downloadUrl + '" class="fileup-name" ' +
                                'download="' + options.files[i].name + '">' + options.files[i].name + '</a>');
                        }
                    }

                    input.fileup.nextID++;
                }
                events.callEvent(input, 'afterRender');
            }
        }
    }


    /**
     * Drop files in queue
     * @param {object} event
     */
    function dropFiles(event) {
        event.preventDefault();
        event.stopPropagation();

        var input   = event.target.fileup.input;
        var options = input.fileup.options;
        var files   = event.target.files || event.dataTransfer.files;

        if (files.length) {
            events.callEvent(input, 'beforeRender');
            for (var i = 0; i < files.length; i++) {
                var file = files[i];

                if (options.sizeLimit > 0 && getFileSize(file) > options.sizeLimit) {
                    events.callEvent(input, 'error', ['size_limit', file]);
                    continue;
                }
                if (options.filesLimit > 0 && Object.keys(files).length >= options.filesLimit) {
                    events.callEvent(input, 'error', ['files_limit', file]);
                    break;
                }
                if (typeof input.accept === 'string') {
                    var accept = input.accept;
                    if (accept && /[^\w]+/.test(accept)) {
                        var is_accept = false;
                        var types = accept.split(',');
                        if (types.length > 0) {
                            for (var t = 0; t < types.length; t++) {
                                types[t] = types[t].replace(/\s/g, '');
                                if (new RegExp(types[t].replace('*', '.*')).test(file.type) ||
                                    new RegExp(types[t].replace('.', '.*/')).test(file.type)
                                ) {
                                    is_accept = true;
                                    break;
                                }
                            }
                        }
                        if ( ! is_accept) {
                            events.callEvent(input, 'error', ['file_type', file]);
                            continue;
                        }
                    }
                }

                if (events.callEvent(input, 'select', [file]) === false) {
                    continue;
                }

                appendFile(file, input);
            }

            $(input).val('');
            events.callEvent(input, 'afterRender');
        }

        events.callEvent(input, 'dragEnd', [event]);
    }


    /**
     * Append files in queue
     */
    function appendFiles() {

        if (this.files.length) {
            var options  = this.fileup.options;
            var multiple = $(this).is("[multiple]");

            if ( ! multiple) {
                if (events.callEvent(this, 'remove', ['*', '1', this.files[0]])) {
                    $('#' + options.queueID).empty();
                    this.fileup.files = {};
                } else {
                    $(this).val('');
                    return;
                }
            }

            events.callEvent(this, 'beforeRender');
            for (var i = 0; i < this.files.length; i++) {
                var file = this.files[i];

                if (options.sizeLimit > 0 && getFileSize(file) > options.sizeLimit) {
                    events.callEvent(this, 'error', ['size_limit', file]);
                    continue;
                }
                if (options.filesLimit > 0 && Object.keys(this.fileup.files).length >= options.filesLimit) {
                    events.callEvent(this, 'error', ['files_limit', file]);
                    break;
                }
                if (typeof this.accept === 'string') {
                    var accept = this.accept;
                    if (accept && /[^\w]+/.test(accept)) {
                        var is_accept = false;
                        var types = accept.split(',');
                        if (types.length > 0) {
                            for (var t = 0; t < types.length; t++) {
                                types[t] = types[t].replace(/\s/g, '');
                                if (new RegExp(types[t].replace('*', '.*')).test(file.type) ||
                                    new RegExp(types[t].replace('.', '.*/')).test(file.type)
                                ) {
                                    is_accept = true;
                                    break;
                                }
                            }
                        }
                        if ( ! is_accept) {
                            events.callEvent(this, 'error', ['file_type', file]);
                            continue;
                        }
                    }
                }
                if (events.callEvent(this, 'select', [file]) === false) {
                    continue;
                }

                appendFile(file, this);
            }
            $(this).val('');
            events.callEvent(this, 'afterRender');
        }
    }


    /**
     * Append file in queue
     * @param {File}   file
     * @param {object} input
     * @returns {bool|void}
     */
    function appendFile(file, input) {

        var options = input.fileup.options;

        if (window.XMLHttpRequest) {
            var xhr = ("onload" in new XMLHttpRequest()) ? new XMLHttpRequest : new XDomainRequest;
        } else if (window.ActiveXObject) {
            try {
                xhr = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (e) {
                try {
                    xhr = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (e) {
                    events.callEvent(input, 'error', ['old_browser', file]);
                    return false;
                }
            }
        } else {
            events.callEvent(input, 'error', ['old_browser', file]);
            return false;
        }

        var tpl = options.templateFile;
        tpl = tpl.replace(/\[INPUT_ID\]/g,   options.inputID);
        tpl = tpl.replace(/\[FILE_NUM\]/g,   input.fileup.nextID);
        tpl = tpl.replace(/\[NAME\]/g,       getFileName(file));
        tpl = tpl.replace(/\[MTYPE\]/g,      file.type);
        tpl = tpl.replace(/\[SIZE\]/g,       getFileSize(file));
        tpl = tpl.replace(/\[SIZE_HUMAN\]/g, formatHuman(getFileSize(file)));
        tpl = tpl.replace(/\[UPLOAD\]/g,     i18n[options.lang].upload);
        tpl = tpl.replace(/\[REMOVE\]/g,     i18n[options.lang].remove);
        tpl = tpl.replace(/\[ABORT\]/g,      i18n[options.lang].abort);

        var fileContainer = {
            xhr: xhr,
            file: file,
            file_number: input.fileup.nextID,
            status: 'stand_by'
        };
        input.fileup.files[input.fileup.nextID] = fileContainer;
        input.fileup.nextID++;


        if (file.type === 'image/gif' || file.type === 'image/png' ||
            file.type === 'image/jpg' || file.type === 'image/jpeg'
        ) {
            if (typeof (FileReader) !== 'undefined') {
                var reader = new FileReader();
                reader.onload = function (ProgressEvent) {
                    tpl = tpl.replace(/\[PREVIEW_SRC\]/g, ProgressEvent.target.result);
                    tpl = tpl.replace(/\[TYPE\]/g, 'fileup-image');
                    $('#' + options.queueID).append(tpl);

                    if (options.autostart) {
                        uploadFile(input, fileContainer);
                    }
                };
                reader.readAsDataURL(file);

            } else {
                tpl = tpl.replace(/\[PREVIEW_SRC\]/g, '');
                tpl = tpl.replace(/\[TYPE\]/g, 'fileup-image fileup-no-preview');
                $('#' + options.queueID).append(tpl);

                if (options.autostart) {
                    uploadFile(input, fileContainer);
                }
            }

        } else {
            tpl = tpl.replace(/\[PREVIEW_SRC\]/g, '');
            tpl = tpl.replace(/\[TYPE\]/g, 'fileup-doc');
            $('#' + options.queueID).append(tpl);

            if (options.autostart) {
                uploadFile(input, fileContainer);
            }
        }
    }


    /**
     * Getter file size
     * @param {File} file
     * @returns {string}
     */
    function getFileName(file) {
        return file.name || file.fileName;
    }


    /**
     * Getter file size
     * @param {File} file
     * @returns {integer}
     */
    function getFileSize(file) {
        return file.size || file.fileSize;
    }


    /**
     * Formatting size
     * @param {integer} bytes
     * @returns {string}
     */
    function formatHuman(bytes) {

        var result = '';

        if (bytes >= 1073741824) {
            result = (bytes / 1073741824).toFixed(2) + ' Gb';
        } else if (bytes >= 1048576) {
            result = (bytes / 1048576).toFixed(2) + ' Mb';
        } else if (bytes >= 1024) {
            result = (bytes / 1024).toFixed(2) + ' Kb';
        } else if (bytes >= 0) {
            result = bytes + ' bytes';
        }

        return result;
    }


    /**
     * Upload file
     * @param {object} input
     * @param {object} fileContainer
     * @returns {boolean}
     */
    function uploadFile(input, fileContainer) {

        var options     = input.fileup.options;
        var file_number = fileContainer.file_number;
        var file        = fileContainer.file;
        var xhr         = fileContainer.xhr;

        if (typeof options.timeout === 'number') {
            xhr.timeout = options.timeout;
        }

        // запрос начат
        xhr.onloadstart = function() {
            fileContainer.status = 'loading';
            events.callEvent(input, 'start', [file_number, file]);
        };

        // браузер получил очередной пакет данных
        xhr.upload.onprogress = function(ProgressEvent) {
            events.callEvent(input, 'progress', [file_number, ProgressEvent, file]);
        };

        // запрос был успешно (без ошибок) завершён
        xhr.onload = function() {
            fileContainer.status = 'loaded';

            if (xhr.status === 200) {
                events.callEvent(input, 'success', [xhr.responseText, file_number, file]);
            } else {
                events.callEvent(input, 'error', ['bad_status', file, file_number, xhr.responseText]);
            }
        };

        // запрос был завершён (успешно или неуспешно)
        xhr.onloadend = function() {
            events.callEvent(input, 'finish', [file_number, file]);
        };

        // запрос был отменён вызовом xhr.abort()
        xhr.onabort = function() {
            fileContainer.status = 'stand_by';
            events.callEvent(input, 'abort', [file_number, file]);
        };

        // запрос был прекращён по таймауту
        xhr.ontimeout = function() {
            fileContainer.status = 'stand_by';
            events.callEvent(input, 'timeout', [file_number, file]);
        };

        // произошла ошибка
        xhr.onerror = function(event) {
            fileContainer.status = 'stand_by';
            events.callEvent(input, 'error', ['error_load', file, file_number, event]);
        };

        xhr.open(options.method, options.url, true);
        xhr.setRequestHeader('Cache-Control',    'no-cache');
        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');


        events.callEvent(input, 'beforeStart', [xhr, file_number, file]);

        if (window.FormData !== undefined) {
            var formData = new FormData();
            formData.append(options.fieldName, file);

            if (Object.keys(options.extraFields).length) {
                $.each(options.extraFields, function(name, value){
                    formData.append(name, value);
                });
            }

            return xhr.send(formData);

        } else {
            // IE 8,9
            return xhr.send(file);
        }
    }



    var methods = {

        /**
         * Добавление нового файла в очередь загрузки
         * @param inputID
         * @param file
         */
        appendFile: function(inputID, file) {
            appendFile(file, document.getElementById(inputID));
        },


        /**
         * Загрузка файла или всех файлов
         * @param inputID
         * @param file_number
         */
        upload: function(inputID, file_number) {
            var input = document.getElementById(inputID);

            if (input && input.type === 'file' && typeof input.fileup === 'object') {
                if (file_number === '*') {
                    $.each(input.fileup.files, function(key, fileContainer) {
                        if (fileContainer.status === 'stand_by') {
                            uploadFile(input, fileContainer);
                        }
                    });

                } else if (typeof input.fileup.files[file_number] === 'object') {
                    uploadFile(input, input.fileup.files[file_number]);
                }
            }
        },


        /**
         * Удаление файла или всех файлов
         * @param inputID
         * @param file_number
         */
        remove: function(inputID, file_number) {
            var input = document.getElementById(inputID);

            if (input && input.type === 'file' && typeof input.fileup === 'object') {
                var options = input.fileup.options;
                var total   = Object.keys(input.fileup.files).length;

                if (file_number === '*') {

                    if (events.callEvent(input, 'remove', ['*', total]) === false) {
                        return;
                    }
                    input.fileup.files = {};
                    $('[id^=fileup-' + inputID + '-]').fadeOut('fast', function(){
                        $(this).remove();
                    });

                } else if (typeof input.fileup.files[file_number] === 'object') {
                    if (events.callEvent(input, 'remove', [input.fileup.files[file_number], total, file_number]) === false) {
                        return;
                    }

                    delete input.fileup.files[file_number];
                    $('#fileup-' + inputID + '-' + file_number).fadeOut('fast', function(){
                        $(this).remove();
                    });
                }
            }
        },


        /**
         * Удаление всех событий
         * @param inputID
         * @param name
         */
        removeEvents: function(inputID, name) {
            var input = document.getElementById(inputID);

            if (input && input.type === 'file' && typeof input.fileup === 'object') {
                events.removeEvents(input, name);
            }
        },


        /**
         * Отмена загрузки
         * @param inputID
         * @param file_number
         */
        abort: function(inputID, file_number) {
            var input = document.getElementById(inputID);

            if (input && input.type === 'file' && typeof input.fileup === 'object') {
                if (file_number === '*') {
                    $.each(input.fileup.files, function(key, fileContainer) {
                        fileContainer.xhr.abort();
                    });

                } else if (typeof input.fileup.files[file_number] === 'object') {
                    input.fileup.files[file_number].xhr.abort();
                }
            }
        }
    };


    /**
     * @param {object|string} param1 Options, inputID
     * @param {string}        param2 Method name
     * @param {string|int}    param3 File number
     * @returns {object}
     */
    $.fileup = function(param1, param2, param3) {
        // Инициализация
        if ( typeof param1 === 'object' ) {
            init(param1);

            var input = document.getElementById(param1.inputID);
            if (input && input.type === 'file' && typeof input.fileup === 'object') {
                eventRegister.input = input;
                return eventRegister;
            }

        // Выполнение метода
        } else if ( typeof param1 === 'string' &&
            typeof param2 === 'string' &&
            typeof methods[param2] == 'function'
        ) {
            methods[param2](param1, param3);

        // Получение списка событий для добавления своего
        } else if ( typeof param1 === 'string' &&
            typeof param2 === 'undefined' &&
            typeof param3 === 'undefined'
        ) {
            var input = document.getElementById(param1);
            if (input && input.type === 'file' && typeof input.fileup === 'object') {
                eventRegister.input = input;
                return eventRegister;
            }

        } else {
            $.error( 'Unknown method ' +  param1 );
        }
    };
})(jQuery);