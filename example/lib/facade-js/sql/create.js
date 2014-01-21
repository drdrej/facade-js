define([
    'underscore'
], function (_) {

    var DEFAULT_TYPE = "TEXT";

    var mapType = function(type) {
        if(!_.isString(type) ) {
            console.error("SQL/Column-Type is not a String. type = " + type + ". Uses default type: TEXT");
            return DEFAULT_TYPE;
        }

        if( !type ) return DEFAULT_TYPE;

        var fixed = type.trim().toUpperCase();

        if( fixed == 'STRING' ) return 'TEXT';

        if( fixed == 'DATE' ) return 'INTEGER';

        if( fixed == 'BOOLEAN' ) return 'INTEGER';

        if( fixed == 'JSON' ) return 'TEXT';

        if( fixed == 'NUMBER' ) return "INTEGER";

        return DEFAULT_TYPE;
    };


    return function (tableName, columns) {
        var sql = "CREATE TABLE IF NOT EXISTS " + tableName;

        if (columns) {
            sql += " ( ";

            var first = true;
            _.each(columns, function (column) {
                var def = "";
                if (!first) {
                    def += ", ";
                }

                var sqlType = mapType(column.type);
                def += column.name + " " + sqlType + " ";

                if (column.isPrimary ) {
                    if( sqlType == 'INTEGER' )
                        def = def + " PRIMARY KEY AUTOINCREMENT ";
                    else
                        def = def + " PRIMARY KEY ";
                }

                sql += def;
                first = false;
            });

            sql += " ) ";
        }

        return sql;
    };
});





