$(document).ready(function() {

    // Simple
    $.fileup({
        url: '/file/upload',
        inputID: 'upload-1',
        queueID: 'upload-1-queue',
        onSuccess: function(response, file_number, file) {
            Snarl.addNotification({
                title: 'Upload success',
                text: file.name,
                icon: '<i class="fa fa-check"></i>'
            });
        },
        onError: function(event, file, file_number) {
            Snarl.addNotification({
                title: 'Upload error',
                text: file.name,
                icon: '<i class="fa fa-times"></i>'
            });
        }
    });


    // Multiple
    $.fileup({
        url: '/file/upload',
        inputID: 'upload-2',
        queueID: 'upload-2-queue',
        lang: 'ru',
        onSelect: function(file) {
            $('#multiple button').show();
        },
        onRemove: function(file, total) {
            if (file === '*' || total === 1) {
                $('#multiple button').hide();
            }
        },
        onSuccess: function(response, file_number, file) {
            Snarl.addNotification({
                title: 'Upload success',
                text: file.name,
                icon: '<i class="fa fa-check"></i>'
            });
        },
        onError: function(event, file, file_number) {
            Snarl.addNotification({
                title: 'Upload error',
                text: file.name,
                icon: '<i class="fa fa-times"></i>'
            });
        }
    });


    // Upload images
    $.fileup({
        url: '/file/upload',
        inputID: 'upload-3',
        queueID: 'upload-3-queue',
        autostart: true
    });


    // Dropzone
    $.fileup({
        url: '/file/upload',
        inputID: 'upload-4',
        queueID: 'upload-4-queue',
        dropzoneID: 'upload-4-dropzone',
    })
        .success(function(response, file_number, file) {
            Snarl.addNotification({
                title: 'Upload success',
                text: file.name,
                icon: '<i class="fa fa-check"></i>'
            });
        })
        .error(function(event, file, file_number) {
            Snarl.addNotification({
                title: 'Upload error',
                text: file.name,
                icon: '<i class="fa fa-times"></i>'
            });
        })
        .dragEnter(function(event) {
            $(event.target).addClass('over');
        })
        .dragLeave(function(event) {
            $(event.target).removeClass('over');
        })
        .dragEnd(function(event) {
            $(event.target).removeClass('over');
        });


    // Uploaded
    $.fileup({
        url: '/file/upload',
        inputID: 'upload-5',
        queueID: 'upload-5-queue',
        files: [
            {
                id: 1,
                name: 'Cat.jpg',
                size: '254361',
                previewUrl: 'img/preview/cat.jpg',
                downloadUrl: 'img/cat.jpg',
                customParam: '123'
            },
            {
                id: 2,
                name: 'Flower.jpg',
                size: '924160',
                previewUrl: 'img/preview/flower.jpg',
                downloadUrl: 'img/flower.jpg',
                customParam: '456'
            },
            {
                name: 'FileUp.zip',
                size: '23040',
                downloadUrl: 'https://github.com/shabuninil/fileup/archive/master.zip'
            }
        ]
    });

    // Theme 2
    $.fileup({
        url: '/file/upload',
        inputID: 'upload-6',
        queueID: 'upload-6-queue',
        files: [
            {
                id: 1,
                name: 'Cat.jpg',
                size: '254361',
                previewUrl: 'img/preview/cat.jpg',
                downloadUrl: 'img/cat.jpg',
                customParam: '123'
            },
            {
                id: 2,
                name: 'Flower.jpg',
                size: '924160',
                previewUrl: 'img/preview/flower.jpg',
                downloadUrl: 'img/flower.jpg',
                customParam: '456'
            },
            {
                name: 'FileUp.zip',
                size: '23040',
                downloadUrl: 'https://github.com/shabuninil/fileup/archive/master.zip'
            }
        ]
    });


    $('pre code').each(function(i, block) {
        hljs.highlightBlock(block);
    });
});