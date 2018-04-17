"use strict";

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

function _Ajax(funs) {
    window._ahrealxhr = window._ahrealxhr || XMLHttpRequest;
    XMLHttpRequest = function XMLHttpRequest() {
        this.xhr = new window._ahrealxhr();
        for (var attr in this.xhr) {
            var type = "";
            try {
                type = _typeof(this.xhr[attr]);
            } catch (e) {}
            if (type === "function") {
                this[attr] = hookfun(attr);
            } else {
                Object.defineProperty(this, attr, {
                    get: getFactory(attr),
                    set: setFactory(attr)
                });
            }
        }
    };

    /**
     * 获取工厂
     */
    function getFactory(attr) {
        return function () {
            return this.hasOwnProperty(attr + "_") ? this[attr + "_"] : this.xhr[attr];
        };
    }

    /**
     * 设置工厂
     */
    function setFactory(attr) {
        return function (f) {
            var xhr = this.xhr;
            var that = this;
            if (attr.indexOf("on") != 0) {
                this[attr + "_"] = f;
                return;
            }
            if (funs[attr]) {
                xhr[attr] = function () {
                    funs[attr](that) || f.apply(xhr, arguments);
                };
            } else {
                xhr[attr] = f;
            }
        };
    }

    /**
     * 钩子函数
     */
    function hookfun(fun) {
        return function () {
            var args = [].slice.call(arguments);
            if (funs[fun] && funs[fun].call(this, args, this.xhr)) {
                return;
            }
            return this.xhr[fun].apply(this.xhr, args);
        };
    }

    return window._ahrealxhr;
}

module.exports = _Ajax;