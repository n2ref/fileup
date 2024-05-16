
import fileUpInstance from './fileup.instance';
import fileUpUtils    from './fileup.utils';

let fileUp = {

    lang: {},

    _instances: {},

    /**
     * Создание экземпляра
     * @param {object} options
     * @returns {object}
     */
    create: function (options) {

        options = fileUpUtils.isObject(options) ? options : {};

        if ( ! options.hasOwnProperty('lang')) {
            options.lang = 'en';
        }

        let langList     = this.lang.hasOwnProperty(options.lang) ? this.lang[options.lang] : {};
        options.langItems = options.hasOwnProperty('langItems') && fileUpUtils.isObject(options.langItems)
            ? $.extend(true, {}, langList, options.langItems)
            : langList;

        let instance = $.extend(true, {}, fileUpInstance);
        instance._init(this, options);

        let id = instance.getId();
        this._instances[id] = instance;

        return instance;
    },


    /**
     * Получение экземпляра по id
     * @param {string} id
     * @returns {object|null}
     */
    get: function (id) {

        if ( ! this._instances.hasOwnProperty(id)) {
            return null;
        }

        if ( ! $.contains(document, this._instances[id]._input[0])) {
            delete this._instances[id];
            return null;
        }

        return this._instances[id];
    }
}

export default fileUp;