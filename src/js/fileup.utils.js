
let fileUpUtils = {


    /**
     * Проверка на объект
     * @param value
     */
    isObject: function (value) {

        return typeof value === 'object' &&
            ! Array.isArray(value) &&
            value !== null;
    },


    /**
     * Проверка на число
     * @param num
     * @returns {boolean}
     * @private
     */
    isNumeric: function(num) {
        return (typeof(num) === 'number' || typeof(num) === "string" && num.trim() !== '') && ! isNaN(num);
    },


    /**
     * Получение размера файла в байтах
     * @param {File} file
     * @return {int|null}
     */
    getFileSize: function (file) {

        if ( ! (file instanceof File)) {
            return null;
        }

        return file.size || file.fileSize;
    },


    /**
     * Получение названия файла
     * @param {File} file
     * @return {string|null}
     */
    getFileName: function (file) {

        if ( ! (file instanceof File)) {
            return null;
        }

        return file.name || file.fileName;
    },


    /**
     * Formatting size
     * @param {int} size
     * @returns {string}
     */
    getSizeHuman: function(size) {

        if ( ! fileUpUtils.isNumeric(size)) {
            return '';
        }

        size = Number(size);

        let result = '';

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
    hashCode: function() {
        return this.crc32((new Date().getTime() + Math.random()).toString()).toString(16);
    },


    /**
     * Hash crc32
     * @param str
     * @returns {number}
     * @private
     */
    crc32: function (str) {

        for (var a, o = [], c = 0; c < 256; c++) {
            a = c;
            for (var f = 0; f < 8; f++) {
                a = 1 & a ? 3988292384 ^ a >>> 1 : a >>> 1
            }
            o[c] = a
        }

        for (var n = -1, t = 0; t < str.length; t++) {
            n = n >>> 8 ^ o[255 & (n ^ str.charCodeAt(t))]
        }

        return (-1 ^ n) >>> 0;
    }
}

export default fileUpUtils;