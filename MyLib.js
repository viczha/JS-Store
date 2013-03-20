(function (window) {
    var MyLib = (function () {
        var myLib = function (selector) {
            return new myLib.fn.init(selector);
        }


        myLib.fn = myLib.prototype = {
            init: function (selector) {

            }
        }

        myLib.fn.init.prototype = myLib.fn;

        return myLib;
    })();

    MyLib.isArray = function (o) {
        return Object.prototype.toString.call(o) == "[object Array]";
    }

    MyLib.isObject = function (o) {
        return Object.prototype.toString.call(o) == "[object Object]";
    }

    MyLib.extend = MyLib.fn.extend = function () {
        var length = arguments.length;
        var target = arguments[0] || {}, i = 1, opts, deep = false;

        if (typeof target == "boolean") {
            deep = target;
            target = arguments[1] || {};
            i = 2;
        }

        if (i == length) {
            i--;
            target = this;
        }

        for (; i < length; i++) {
            opts = arguments[i];
            if (opts != null && typeof opts == "object") {
                for (var k in opts) {
                    var source = target[k], copy = opts[k];
                    if (deep && (MyLib.isObject(copy) || MyLib.isArray(copy))) {
                        var clone;
                        if (MyLib.isArray(copy)) {
                            clone = source ? source : [];
                        } else {
                            clone = source ? source : {};
                        }

                        target[k] = MyLib.extend(true, clone, copy);

                    } else {
                        taget[k] = copy;
                    }
                }
            }
        }

        return target;
    };

    MyLib.extend({

    });

    MyLib.createClass = function () {
        var parent;

        var newClass = function () {
            this.init.call(this, arguments);
        };

        var argArray = [];

        for (var i = 0; i < arguments.length; i++) {
            argArray.push(arguments[i]);
        }

        if (arguments.length > 0 && typeof arguments[0] == "function") {
            parent = argArray.shift();
        }

        for (var i = 0; i < argArray.length; i++) {
            if (Object.prototype.toString.call(argArray[i]) == "[object Object]") {

            }
        }

        if (!newClass.prototype.init) {
            newClass.prototype.init = function () { };
        }



    }

})(window)
