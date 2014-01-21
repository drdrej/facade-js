define([], function () {

    return function (tableName) {
        var rval = "DROP TABLE IF EXISTS " + tableName;
        console.log( "drop table by query: " + rval);

        return rval;
    };
});





