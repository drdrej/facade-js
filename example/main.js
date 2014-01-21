/**
 * config dependencies:
 */
require.config({
    paths: {
        'underscore': 'lib/underscore-min',
        'stringjs': 'lib/string-min',
        'moment': 'lib/moment-min',

        'dbEnv': 'lib/facade-js/DBEnv',
        'db': 'lib/facade-js/DBConnect',
        'dbInstall': 'lib/facade-js/DBInstall',

        'sql-update': 'lib/facade-js/sql/update',
        'sql-create': 'lib/facade-js/sql/create',
        'sql-del': 'lib/facade-js/sql/delete',
        'sql-drop': 'lib/facade-js/sql/drop-table',
        'sql-insert': 'lib/facade-js/sql/insert',
        'sql-map': 'lib/facade-js/sql/map',
        'sql-select': 'lib/facade-js/sql/select'
    }
});

// var initialize = function ( name, size, version, doAfter ) {

/**
 *  initialize db-module and calls init-procedure.
 */
require([ 'dbEnv' ], function (DbEnv) {
    DbEnv.initialize("exampleDB", 100000, 1, [
        {
            "table": "app",
            "columns": [
                {
                    "name": "name",
                    "type": "String",
                    "index": true,
                    "isPrimary": true
                },

                {
                    "name": "value",
                    "type": "Boolean",
                    "index": true
                }

            ]
        },

        {
            "table": "account",
            "columns": [
                {
                    "name": "_id",
                    "type": "Number",
                    "isPrimary": true,
                    "index": true
                },

                {
                    "name": "email",
                    "type": "String"
                },

                {
                    "name": "password",
                    "type": "String"
                },

                {
                    "name": "isActive",
                    "type": "Boolean"
                }
            ]
        }
    ],
        function () {
            console.log("db initialization forced.");
        });
});

