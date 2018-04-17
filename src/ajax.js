function _Ajax(funs) {
    window._ahrealxhr = window._ahrealxhr || XMLHttpRequest
    XMLHttpRequest = function () {
        this.xhr = new window._ahrealxhr;
        for (let attr in this.xhr) {
            let type = "";
            try {
                type = typeof this.xhr[attr]
            } catch (e) { }
            if (type === "function") {
                this[attr] = hookfun(attr);
            } else {
                Object.defineProperty(this, attr, {
                    get: getFactory(attr),
                    set: setFactory(attr)
                })
            }
        }
    }

    /**
     * 获取工厂
     */
    function getFactory(attr) {
        return function () {
            return this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
        }
    }

    /**
     * 设置工厂
     */
    function setFactory(attr) {
        return function (f) {
            let xhr = this.xhr;
            let that = this;
            if (attr.indexOf("on") != 0) {
                this[attr + "_"] = f;
                return;
            }
            if (funs[attr]) {
                xhr[attr] = function () {
                    funs[attr](that) || f.apply(xhr, arguments);
                }
            } else {
                xhr[attr] = f;
            }
        }
    }

    /**
     * 钩子函数
     */
    function hookfun(fun) {
        return function () {
            let args = [].slice.call(arguments)
            if (funs[fun] && funs[fun].call(this, args, this.xhr)) {
                return;
            }
            return this.xhr[fun].apply(this.xhr, args);
        }
    }
    
    return window._ahrealxhr;
}

module.exports = _Ajax