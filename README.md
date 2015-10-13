# uploadH5
Upload HTML 5 a library for uploading files to the server.  
Supports multiple file selection, drag&drop and progress bar for jQuery.

![Interface](https://dl.dropboxusercontent.com/u/31670130/img/uploadh5.png)

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
<div id="file-[INPUT_ID]-[FILE_NUM]" class="uploadH5-file [TYPE]"> 
    <div class="preview"> 
        <img src="[PREVIEW_SRC]" alt="[NAME]"/> 
    </div> 
    <div class="data"> 
        <div class="description"> 
            <span class="file-name">[NAME]</span> (<span class="file-size">[SIZE_HUMAN]</span>) 
        </div> 
        <div class="controls"> 
            <span class="remove" onclick="$.uploadH5(\'[INPUT_ID]\', \'remove\', \'[FILE_NUM]\');" title="[REMOVE]"></span> 
            <span class="upload" onclick="$.uploadH5(\'[INPUT_ID]\', \'upload\', \'[FILE_NUM]\');">[UPLOAD]</span> 
            <span class="abort" onclick="$.uploadH5(\'[INPUT_ID]\', \'abort\', \'[FILE_NUM]\');" style="display:none">[ABORT]</span> 
        </div> 
        <div class="result"></div> 
        <div class="uploadH5-progress"> 
            <div class="uploadH5-progress-bar"></div> 
        </div> 
    </div> 
    <div class="clear"></div> 
</div>
```
