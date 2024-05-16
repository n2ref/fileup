$(document).ready(function() {

    // Simple
    fileUp.create({
        url: '/src/file.json',
        input: 'upload1',
        queue: 'upload1-queue',
        onSuccess: function(file, response) {
            alert('Upload success');
        },
        onError: function(errorType, options) {
            alert('Upload error');
        }
    });


    // Multiple
    fileUp.create({
        id: 'multiple',
        url: '/src/file.json',
        input: 'upload2',
        queue: 'upload2-queue',
        lang: 'en',
        onSelect: function(file) {
            $('#multiple button').show();
        },
        onRemove: function(file) {
            if (Object.keys(this.getFiles()).length === 0) {
                $('#multiple button').hide();
            }
        },
        onSuccess: function(file, response) {
            alert('Upload success');
        },
        onError: function(errorType, options) {
            alert('Upload error');
        }
    });


    // Upload images
    fileUp.create({
        url: '/src/file.json',
        input: 'upload3',
        queue: 'upload3-queue',
        autostart: true,
        filesLimit: 3,
        sizeLimit: 1048576 // 1 Mb
    });


    // Dropzone
    let fileUpDrop = fileUp.create({
        url: '/src/file.json',
        input: 'upload4',
        queue: 'upload4-queue',
        dropzone: 'upload4-dropzone',
    })

    fileUpDrop.on('load_success', function(file, response) {
        alert('Upload success');
    });
    fileUpDrop.on('error', function(errorType, options) {
        alert('Upload error');
    });

    fileUpDrop.on('dragEnter', function(event) {
        console.log('dragEnter');
    });
    fileUpDrop.on('dragLeave', function(event) {
        console.log('dragLeave');
    });
    fileUpDrop.on('dragEnd', function(event) {
        console.log('dragEnd');
    });


    // Uploaded
    fileUp.create({
        url: '/src/file.json',
        input: 'upload5',
        queue: 'upload5-queue',
        files: [
            {
                name: 'Cat.jpg',  // required
                size: '254361',
                urlPreview: 'src/img/preview/cat.jpg',
                urlDownload: 'img/cat.jpg',
            },
            {
                name: 'Flower.jpg',  // required
                size: 924160,
                urlPreview: 'src/img/preview/flower.jpg',
                urlDownload: 'img/flower.jpg',
            },
            {
                name: 'FileUp.zip',
                size: 23040,
                urlDownload: 'https://github.com/n2ref/fileup/archive/master.zip'
            }
        ]
    });

    // File template
    fileUp.create({
        url: '/src/file.json',
        input: document.getElementById('upload6'),
        queue: document.getElementById('upload6-queue'),
        files: [
            {
                name: 'Cat.jpg', // required
                size: 254361,
                urlPreview: 'src/img/preview/cat.jpg',
                urlDownload: 'img/cat.jpg',
            },
            {
                name: 'Flower.jpg', // required
                size: 924160,
                urlPreview: 'src/img/preview/flower.jpg',
                urlDownload: 'img/flower.jpg',
            },
            {
                name: 'FileUp.zip'
            }
        ],
        templateFile:
            '<div style="width:125px" class="fileup-file [TYPE] mb-2 p-1 d-flex flex-column gap-2 bg-light border border-secondary-subtle rounded rounded-1">' +
                '<div class="fileup-preview">' +
                    '<img src="[PREVIEW_SRC]" alt="[NAME]" class="border rounded"/>' +
                    '<i class="fileup-icon fs-4 text-secondary"></i>' +
                '</div>' +
                '<div class="flex-fill">' +
                    '<div class="fileup-description">' +
                        '<span class="fileup-name">[NAME]</span> ' +
                        '<small class="fileup-size text-nowrap text-secondary">([SIZE])</small>' +
                    '</div>' +
                    '<div class="fileup-controls mt-1 d-flex gap-2">' +
                        '<span class="fileup-remove" title="[REMOVE]">✕</span>' +
                        '<span class="fileup-upload link-primary">[UPLOAD]</span>' +
                        '<span class="fileup-abort link-primary" style="display:none">[ABORT]</span>' +
                    '</div>' +
                    '<div class="fileup-result"></div>' +
                    '<div class="fileup-progress progress mt-2 mb-1">' +
                        '<div class="fileup-progress-bar progress-bar"></div>' +
                    '</div>' +
                '</div>' +
            '</div>'
    });


    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });
});