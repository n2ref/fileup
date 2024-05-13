import fileUpUtils from "./fileup.utils";

let fileUpEvents = {

    /**
     * Событие начала загрузки
     * @param {object} file
     */
    onLoadStart: function(file) {

        let $file = file.getElement();

        if ($file) {
            $file.find('.fileup-upload').hide();
            $file.find('.fileup-abort').show();

            $file.find('.fileup-result')
                .removeClass('fileup-error')
                .removeClass('fileup-success')
                .text('');
        }
    },


    /**
     * Событие начала изменения прогресса загрузки
     * @param {object}        file
     * @param {ProgressEvent} ProgressEvent
     */
    onLoadProgress: function(file, ProgressEvent) {

        if (ProgressEvent.lengthComputable) {
            let percent = Math.ceil(ProgressEvent.loaded / ProgressEvent.total * 100);
            let $file   = file.getElement();

            if ($file) {
                $file.find('.fileup-progress-bar').css('width', percent + "%");
            }
        }
    },


    /**
     * Событие начала загрузки
     * @param {object} file
     */
    onLoadAbort: function(file) {

        let $file = file.getElement();

        if ($file) {
            $file.find('.fileup-abort').hide();
            $file.find('.fileup-upload').show();
            $file.find('.fileup-result')
                .removeClass('fileup-error')
                .removeClass('fileup-success')
                .text('');
        }
    },


    /**
     * Событие успешной загрузки файла
     * @param {object} file
     */
    onSuccess: function(file) {

        let $file = file.getElement();

        if ($file) {
            let lang = this.getLang();

            $file.find('.fileup-abort').hide();
            $file.find('.fileup-upload').hide();
            $file.find('.fileup-result')
                .removeClass('fileup-error')
                .addClass('fileup-success')
                .text(lang.complete);
        }
    },


    /**
     * Событие ошибки
     * @param {string} eventName
     * @param {object} options
     */
    onError: function(eventName, options) {

        let lang = this.getLang();

        switch(eventName) {
            case 'files_limit':
                alert(lang.errorFilesLimit.replace(/%filesLimit%/g, options.filesLimit));
                break;

            case 'size_limit':
                let size    = fileUpUtils.getSizeHuman(options.sizeLimit);
                let message = lang.errorSizeLimit;

                message = message.replace(/%sizeLimit%/g, size);
                message = message.replace(/%fileName%/g,  fileUpUtils.getFileName(options.fileData));

                alert(message);
                break;

            case 'file_type':
                alert(lang.errorFileType.replace(/%fileName%/g, fileUpUtils.getFileName(options.fileData)));
                break;

            case 'load_bad_status':
            case 'load_error':
            case 'load_timeout':
                let $file = options.file.getElement();

                if ($file) {
                    let message = eventName === 'load_bad_status'
                        ? lang.errorBadStatus
                        : lang.errorLoad;

                    $file.find('.fileup-abort').hide();
                    $file.find('.fileup-upload').show();
                    $file.find('.fileup-result')
                        .addClass('fileup-error')
                        .text(message);
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
    onDragOver: function(event) {

        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';

        let dropzone = this.getDropzone();

        if (dropzone) {
            dropzone.addClass('over');
        }
    },


    /**
     * Событие завершения перетаскивания с отпускаем кнопки мыши
     * @param {Event} event
     */
    onDragLeave: function(event) {

        let dropzone = this.getDropzone();
        if (dropzone) {
            dropzone.removeClass('over');
        }
    },


    /**
     * Событие когда перетаскиваемый элемент или выделенный текст покидают допустимую цель перетаскивания
     * @param {Event} event
     */
    onDragEnd: function(event) {

        let dropzone = this.getDropzone();
        if (dropzone) {
            dropzone.removeClass('over');
        }
    },


    /**
     * Событие переноса файла в dropzone
     * @param {Event} event
     */
    onDragEnter: function(event) {

        event.stopPropagation();
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    }
}

export default fileUpEvents;