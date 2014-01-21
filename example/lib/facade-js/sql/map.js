define([
    'underscore'
], function (_) {

    return function (entry) {
        if( !entry )  {
            console.error( "couldn't map entry-value to db value. entry-object is missing." );
            return "";
        }

        var value = entry.value;

        if(_.isString(value) ) {
            return "'" + value + "'";
        }

        if(_.isNumber(value) ) {
            return value;
        }

        if(_.isDate(value) )
            return value.getTime();

        return entry.value;
    };
});

