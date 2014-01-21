define([
    'underscore',
    'stringjs',
    'sql-map'
], function (_, S, mapValue) {


    /**
     * values = [ { name: ..., value: ...} ]
     */
    return function (tableName, values) {
        var sql = "INSERT OR REPLACE INTO " + tableName;

        if( !_.isArray(values) ) {
            console.error( "second parameter 'values' is not valid. should be an array of objects filled with length > 0" );
            return;
        }

        if (values && values.length > 0) {
            var first = true;
            var columnSQL = "(";
            var valueSQL = "(";

            _.each(values, function (entry) {
                var separator = "";
                if (!first) {
                    separator += ", ";
                }

                columnSQL += separator + entry.name;
                valueSQL += separator + mapValue(entry);

                first = false;
            });

            columnSQL += ")";
            valueSQL += ")";

            sql += columnSQL + " VALUES " + valueSQL;
        }

        return sql;
    };
});





