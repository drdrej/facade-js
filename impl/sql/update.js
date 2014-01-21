define([
    'underscore',
    'stringjs',
    'sql-map'
], function (_, S, mapValue) {

    /**
     * values : [ {
     *     name: paramName,
     *     value: paramValue
     * }]
     */
    return function (tableName, values, where) {
        var sql = "UPDATE " + tableName;
        var hasNewValues = false;

        if (values) {
            sql += " SET ";

            var first = true;
            _.each(values, function (column) {
                var separator = "";
                if (!first) {
                    separator += ", ";
                }

                // if( column.value == null )
                //     continue;

                var columnValue = column.name + " = " + mapValue(column);
                sql += separator + columnValue;

                first = false;
                hasNewValues = true;
            });
        }

        if( !hasNewValues ) {
            console.error( "no values passed for UPDATE");
            return null;
        }

        if( where && _.isString(where) )
            sql += " WHERE " + where;

        return sql;
    };
});





