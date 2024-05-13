# FileUp 
Библиотека для загрузки файлов на сервер.
Поддерживает выбор нескольких файлов, перетаскивание и индикатор выполнения.

[[DEMO]](https://n2ref.github.io/fileup/)

![Interface](https://raw.githubusercontent.com/n2ref/fileup/gh-pages/src/img/preview.png)

## Documentation

### Install with npm
```shell
$ npm install fileup-js
```

### 1. Events

- onSelect (file)
- onRemove (file)
- onBeforeStart (file, xhr)
- onStart (file)
- onProgress (file, ProgressEvent)
- onSuccess (file, response)
- onError (errorType, options)
- onAbort (file)
- onFinish (file)
- onDragEnter (event)
- onDragOver (event)
- onDragLeave (event)
- onDragEnd (event)

### 2. Options

- id: '',
- url: '',
- input: '',
- queue: '',
- dropzone: '',
- files: [],
- fieldName: 'file',
- extraFields: {},
- lang: 'en',
- sizeLimit: 0,
- filesLimit: 0,
- httpMethod: 'post',
- timeout: null,
- autostart: false,
- templateFile:
 
```html
<div class="fileup-file [TYPE] mb-2 p-1 d-flex flex-nowrap gap-2 bg-light border border-secondary-subtle rounded rounded-1">
    <div class="fileup-preview">
        <img src="[PREVIEW_SRC]" alt="[NAME]" class="border rounded"/>
        <i class="fileup-icon fs-4 text-secondary"></i>
    </div>
    <div class="flex-fill">
        <div class="fileup-description">
            <span class="fileup-name">[NAME]</span>
            <small class="fileup-size text-nowrap text-secondary">([SIZE])</small>
        </div>

        <div class="fileup-controls mt-1 d-flex gap-2">
            <span class="fileup-remove" title="[REMOVE]">✕</span>
            <span class="fileup-upload link-primary">[UPLOAD]</span>
            <span class="fileup-abort link-primary" style="display:none">[ABORT]</span>
        </div>

        <div class="fileup-result"></div>

        <div class="fileup-progress progress mt-2 mb-1">
            <div class="fileup-progress-bar progress-bar"></div>
        </div>
    </div>
</div>
```
