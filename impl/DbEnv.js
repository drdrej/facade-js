define([
    'underscore',
    'stringjs',
    'moment',

    'db',
    'dbInstall'

], function (_, S, Moment, Database, DBInstallation) {
    console.log("-- starts database-environment");

    var startAppHook = function( dbManager, doAfter ) {
        console.log( "-- call start-app-hook." );
        // TODO: add cache here

        if( doAfter && _.isFunction(doAfter) ) {
            doAfter(dbManager);
        }
    };

    /**
     * init database.
     *
     * @param name
     * @param size
     * @param version
     * @param doAfter
     */
    var initialize = function ( name, size, version, entities, doAfter ) {
        var dbManager = new Database(name, size);
        dbManager.open(version);

        dbManager.isInstalled(
            function() {
                console.log( "-- db " + name + " is installed!");
                startAppHook( dbManager, doAfter );
            },

            function () {
                console.log( "-- db " + name + " is NOT installed!");

                DBInstallation.install(dbManager, entities, function() {
                    dbManager.doneInstallation( function() {
                        startAppHook( dbManager, doAfter );
                    });
                });
            }
        );
    };

    return {
        initialize: initialize
    };
});
