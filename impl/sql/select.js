define([], function () {

    return function (tableName, where) {
        var sql = "SELECT * FROM " + tableName;

        if( !where )
            return sql;

        if(_.isString(where) ) {
            sql += " WHERE " + where;
        }

        return sql;
    };
});
