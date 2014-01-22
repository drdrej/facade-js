define([
    'underscore',
    'stringjs',
    'moment',

    'sql-create',
    'sql-drop'

], function (_, S, moment, createSQL, dropTableSQL) {

    var openModel = function(def) {
        if(_.isString(def) ) {
            var json = JSON.parse(def);

            console.log( "-- schema loaded & pased successful: " );
            console.log(json);

            return json;
        }

        // is object: return as it is.
        return def;
    };

    var install = function (dbManager, defs, success, fail) {
        console.log( "-- start DB- Installation  Script!" );

        var sqls = [];

        _.each( defs, function( def ) {
            var json = openModel(def);

            var drop = dropTableSQL( json.table );
            sqls.push( drop );

            var create = createSQL( json.table, json.columns);
            sqls.push( create );
        });

        dbManager.createTable(sqls, success, fail);
    };

    return {
        install: install
    };

});
