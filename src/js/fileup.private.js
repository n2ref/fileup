
import fileUpFile   from "./fileup.file";
import fileUpUtils  from "./fileup.utils";
import fileUpEvents from "./fileup.events";


let fileUpPrivate = {

    /**
     *
     * @param {object} fileUp
     */
    initInput: function (fileUp) {

        let input = null;

        if (fileUp._options.input instanceof HTMLElement ||
            fileUp._options.input instanceof jQuery
        ) {
            input = $(fileUp._options.input);

        } else if (typeof fileUp._options.input === 'string' &&
                   fileUp._options.input
        ) {
            input = $('#' + fileUp._options.input);
        }

        if ( ! input || ! $(input)[0] || $(input)[0].type !== 'file') {
            throw new Error('Not found input element');
        }

        fileUp._input = input;
    },


    /**
     *
     * @param {object} fileUp
     */
    initQueue: function (fileUp) {

        let queue = null;

        if (fileUp._options.queue instanceof HTMLElement ||
            fileUp._options.queue instanceof jQuery
        ) {
            queue = $(fileUp._options.queue);

        } else if (typeof fileUp._options.queue === 'string' &&
                   fileUp._options.queue
        ) {
            queue = $('#' + fileUp._options.queue);
        }

        if ( ! queue || ! $(queue)[0]) {
            throw new Error('Not found queue element');
        }

        fileUp._queue = queue;
    },


    /**
     *
     * @param {object} fileUp
     */
    initDropzone: function (fileUp) {

        let dropzone = null;

        if (fileUp._options.dropzone instanceof HTMLElement ||
            fileUp._options.dropzone instanceof jQuery
        ) {
            dropzone = $(fileUp._options.dropzone);

        } else if (typeof fileUp._options.dropzone === 'string' &&
                   fileUp._options.dropzone
        ) {
            dropzone = $('#' + fileUp._options.dropzone);
        }


        if (dropzone) {
            fileUp._dropzone = dropzone;

            let that = this;

            dropzone.on('click', function () {
                fileUp.getInput().click();
            });

            dropzone[0].addEventListener('dragover', function (event) {
                that.trigger(fileUp, 'drag_over', [event]);
            });

            dropzone[0].addEventListener('dragleave', function (event) {
                that.trigger(fileUp, 'drag_leave', [event]);
            });

            dropzone[0].addEventListener('dragenter', function (event) {
                that.trigger(fileUp, 'drag_enter', [event]);
            });

            dropzone[0].addEventListener('dragend', function (event) {
                that.trigger(fileUp, 'drag_end', [event]);
            });

            dropzone[0].addEventListener('drop', function (event) {
                fileUp.getInput()[0].files = event.target.files || event.dataTransfer.files
                that.appendFiles(fileUp, event)
            });
        }
    },


    /**
     * Инициализация событий
     * @param {object} fileUp
     */
    initEvents: function (fileUp) {

        /**
         * @param {string}          name
         * @param {function|string} func
         */
        function setEvent(name, func) {

            let event = null;

            if (typeof func === 'function') {
                event = func;
            } else if (typeof func === 'string') {
                event = new Function(func);
            }

            if (event) {
                fileUp.on(name, event);
            }
        }


        let options = fileUp.getOptions();
        let that    = this;

        setEvent('load_start',    fileUpEvents.onLoadStart);
        setEvent('load_progress', fileUpEvents.onLoadProgress);
        setEvent('load_abort',    fileUpEvents.onLoadAbort);
        setEvent('load_success',  fileUpEvents.onSuccess);
        setEvent('error',         fileUpEvents.onError);
        setEvent('drag_over',     fileUpEvents.onDragOver);
        setEvent('drag_leave',    fileUpEvents.onDragEnter);
        setEvent('drag_end',      fileUpEvents.onDragLeave);
        setEvent('drag_enter',    fileUpEvents.onDragEnd);

        if (options.onSelect)       { setEvent('select',            options.onSelect) }
        if (options.onRemove)       { setEvent('remove',            options.onRemove) }
        if (options.onBeforeStart)  { setEvent('load_before_start', options.onBeforeStart) }
        if (options.onStart)        { setEvent('load_start',        options.onStart) }
        if (options.onProgress)     { setEvent('load_progress',     options.onProgress) }
        if (options.onAbort)        { setEvent('load_abort',        options.onAbort) }
        if (options.onSuccess)      { setEvent('load_success',      options.onSuccess) }
        if (options.onFinish)       { setEvent('load_finish',       options.onFinish) }
        if (options.onError)        { setEvent('error',             options.onError) }
        if (options.onDragOver)     { setEvent('drag_over',         options.onDragOver) }
        if (options.onDragLeave)    { setEvent('drag_leave',        options.onDragLeave) }
        if (options.onDragEnd)      { setEvent('drag_end',          options.onDragEnd) }
        if (options.onDragEnter)    { setEvent('drag_enter',        options.onDragEnter) }


        fileUp.getInput().on('change', function (event) {
            that.appendFiles(fileUp, event);
        });
    },


    /**
     * Формирование списка ранее загруженных файлов
     * @param {object} fileUp
     */
    renderFiles: function (fileUp) {

        let options = fileUp.getOptions();

        if (Array.isArray(options.files) && options.files.length > 0) {
            for (var i = 0; i < options.files.length; i++) {
                if ( ! fileUpUtils.isObject(options.files[i])) {
                    continue;
                }

                options.files[i].id     = fileUp._fileIndex
                options.files[i].status = 'loaded'

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
    trigger: function(fileUp, name, params) {

        params = params || [];
        let results = [];

        if (fileUp._events[name] instanceof Object && fileUp._events[name].length > 0) {
            for (var i = 0; i < fileUp._events[name].length; i++) {
                let callback = fileUp._events[name][i].callback;

                results.push(
                    callback.apply(fileUp._events[name][i].context || fileUp, params)
                );

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
    appendFiles: function(fileUp, event) {

        event.preventDefault();
        event.stopPropagation();

        let options  = fileUp.getOptions();
        let input    = fileUp.getInput();
        let files    = input[0].files;
        let multiple = input.is("[multiple]");

        if (files.length > 0) {
            for (var i = 0; i < files.length; i++) {
                let file = files[i];

                if (options.sizeLimit > 0 && fileUpUtils.getFileSize(file) > options.sizeLimit) {
                    this.trigger(fileUp, 'error', ['size_limit', { fileData: file, sizeLimit: options.sizeLimit }]);
                    continue;
                }

                if (options.filesLimit > 0 && Object.keys(fileUp._files).length >= options.filesLimit) {
                    this.trigger(fileUp, 'error', ['files_limit', { fileData: file, filesLimit: options.filesLimit }]);
                    break;
                }

                if (typeof input[0].accept === 'string') {
                    let accept = input[0].accept;
                    if (accept && /[^\w]+/.test(accept)) {
                        let isAccept = false;
                        let types    = accept.split(',');

                        if (types.length > 0) {
                            for (var t = 0; t < types.length; t++) {
                                types[t] = types[t].replace(/\s/g, '');
                                if (new RegExp(types[t].replace('*', '.*')).test(file.type) ||
                                    new RegExp(types[t].replace('.', '.*/')).test(file.type)
                                ) {
                                    isAccept = true;
                                    break;
                                }
                            }
                        }
                        if ( ! isAccept) {
                            this.trigger(fileUp, 'error', ['file_type', { fileData: file }]);
                            continue;
                        }
                    }
                }

                let results = this.trigger(fileUp, 'select', [file]);

                if (results) {
                    let isContinue = false;

                    $.each(results, function (key, result) {
                        if (result === false) {
                            isContinue = true;
                            return false;
                        }
                    })

                    if (isContinue) {
                        continue;
                    }
                }

                if ( ! multiple) {
                    fileUp.removeAll();
                }

                this.appendFile(fileUp, file);

                if ( ! multiple) {
                    break;
                }
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
    appendFile: function (fileUp, file) {

        let options      = fileUp.getOptions();
        let fileInstance = $.extend(true, {}, fileUpFile);
        let data         = {
            id:   fileUp._fileIndex,
            name: fileUpUtils.getFileName(file),
            size: fileUpUtils.getFileSize(file),
            type: file.type,
        };


        fileInstance._init(fileUp, data, file);

        fileUp._files[fileUp._fileIndex] = fileInstance;

        let queue = fileUp.getQueue();
        if (queue) {
            queue.append(
                fileInstance.render(options.templateFile)
            );
        }

        fileUp._fileIndex++;


        if (typeof fileUp._options.autostart === 'boolean' &&
            fileUp._options.autostart
        ) {
            fileInstance.upload();
        }
    },


    /**
     * Добавление файла в список из данных
     * @param {object} fileUp
     * @param {object} data
     */
    appendFileByData: function (fileUp, data) {

        let options      = fileUp.getOptions();
        let fileInstance = $.extend(true, {}, fileUpFile);

        fileInstance._init(fileUp, data);

        fileUp._files[fileUp._fileIndex] = fileInstance;

        let queue = fileUp.getQueue();
        if (queue) {
            queue.append(
                fileInstance.render(options.templateFile)
            );
        }

        fileUp._fileIndex++;
    }
}

export default fileUpPrivate;