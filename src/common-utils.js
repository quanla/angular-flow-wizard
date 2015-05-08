"use strict";

var ObjectUtil = ObjectUtil || {};

ObjectUtil.clone = function(obj) {
    if (obj == null
        || typeof obj != "object"
    ) {
        return obj;
    } else if (obj.length == null) {
        var ret = {};
        for ( var i in obj) {
            if (obj.hasOwnProperty(i)) {
                ret[i] = ObjectUtil.clone(obj[i]);
            }
        }
        return ret;
    } else {
        var ret = [];
        for (var i = 0; i < obj.length; i++) {
            ret[i] = ObjectUtil.clone(obj[i]);
        }
        return ret;
    }
};
ObjectUtil.copy = function(fromO, toO) {
    for (var name in fromO) {
        toO[name] = fromO[name];
    }
};

var Cols = Cols || {};

Cols.isEmpty = function(col) {
    return col == null || col.length == 0;
};

Cols.isNotEmpty = function(col) {
    return !Cols.isEmpty(col);
};
