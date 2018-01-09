# FileUp 
Upload HTML 5 is a library for uploading files to the server.  
Supports multiple file selection, drag&drop and progress bar for jQuery.

[[DEMO]](https://shabuninil.github.io/fileup/)

![Interface](https://raw.githubusercontent.com/shabuninil/fileup/gh-pages/preview.png)

## Documentation

### 1. Events

- onSelect (file)
- onRemove (file_number, total, file)
- onBeforeStart (file_number, xhr, file)
- onStart (file_number, file)
- onProgress (file_number, ProgressEvent, file)
- onSuccess (file_number, response, file)
- onError (event, file, file_number, response)
- onAbort (file_number, file)
- onTimeout (file_number, file)
- onFinish (file_number, file)
- onDragEnter (event)
- onDragOver (event)
- onDragLeave (event)
- onDragEnd (event)

System events

- onStartSystem (file_number, file)
- onSuccessSystem (file_number, file)
- onErrorSystem (event, file, file_number)
- onAbortSystem (file_number, file)
- onTimeoutSystem (file_number, file)

### 2. Options

- url: window.location.pathname + window.location.search,
- inputID: '',
- queueID: '',
- dropzoneID: '',
- files: [],
- fieldName: 'filedata',
- extraFields: {},
- lang: 'en',
- sizeLimit: 0,
- filesLimit: 0,
- method: 'post',
- timeout: null,
- autostart: false,
- templateFile:
 
```html
<div id="fileup-[INPUT_ID]-[FILE_NUM]" class="fileup-file [TYPE]"> 
    <div class="fileup-preview"> 
        <img src="[PREVIEW_SRC]" alt="[NAME]"/> 
    </div> 
    <div class="fileup-container"> 
        <div class="fileup-description"> 
            <span class="fileup-name">[NAME]</span> (<span class="fileup-size">[SIZE_HUMAN]</span>) 
        </div> 
        <div class="fileup-controls"> 
            <span class="fileup-remove" onclick="$.fileup(\'[INPUT_ID]\', \'remove\', \'[FILE_NUM]\');" title="[REMOVE]"></span> 
            <span class="fileup-upload" onclick="$.fileup(\'[INPUT_ID]\', \'upload\', \'[FILE_NUM]\');">[UPLOAD]</span> 
            <span class="fileup-abort" onclick="$.fileup(\'[INPUT_ID]\', \'abort\', \'[FILE_NUM]\');" style="display:none">[ABORT]</span> 
        </div> 
        <div class="fileup-result"></div> 
        <div class="fileup-progress"> 
            <div class="fileup-progress-bar"></div> 
        </div> 
    </div> 
    <div class="fileup-clear"></div> 
</div>
```
