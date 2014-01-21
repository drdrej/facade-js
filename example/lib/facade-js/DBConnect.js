define([
    'underscore',
    'stringjs',

    'sql-insert',
    'sql-select',
    'sql-del',
    'sql-update'

], function (_, S, insertSQL, selectSQL, deleteSQL, updateSQL) {


    /**
     * Describes a database.
     *
     * @param name {{String}} - name of the database
     * @param {{int}} - size size in bytes [optional] default = 1000000
     * @param {{String}} - description [optional]
     * @constructor
     */
    var Database = function ( name, size, description ) {
        this.name = name;
        this.size = size;
        this.desc = (_.isString(description)) ? description : (name+"-DB");
    }

    /**
     * open datatabse connection.
     *
     * @param version
     */
    Database.prototype.open = function (version) {
        var hasPlugin = (window.sqlitePlugin && _.has(window.sqlitePlugin, 'openDatabase'));

        var useDB = null;

        if ( !hasPlugin ) {
            useDB = window.openDatabase;
            console.log("[DB-INSTALL] is running in browser. Uses WebSQL-DB.");
        } else {
            useDB = sqlitePlugin.openDatabase;
            console.log("[DB-INST] use sqlite-dropin for phonegap.");
        }

        this.db = useDB(this.name, version, this.desc, this.size);
    };

    /**
     * default error handler. prints error into console.
     *
     * @param e
     */
    Database.prototype.dbErrorHandler = function (e) {
        console.log('DB Error ::: ');
        console.error(e);

        return;
    };

    /**
     * this lifecycle will be called after installation is done.
     *
     * @param success
     * @param fail
     */
    Database.prototype.doneInstallation = function (success, fail) {
        var hasSuccessFnc = (success && _.isFunction(success));
        if (!hasSuccessFnc) {
            console.log("-- success-function is not valid. skip it.");

            success = function () {
                console.log("-- installation successful.");
            };
        }

        if (!(fail && _.isFunction(fail))) {
            fail = this.dbErrorHandler;
        }

        this.insert("app", [
            {
                name: "name",
                value: 'installed'
            },
            {
                name: "value",
                value: 1
            }
        ], success, fail);
    };


    /**
     * check method to callback a function if an app is installed or even not.
     *
     * @param isInstalled
     * @param isNotInstalled
     */
    Database.prototype.isInstalled = function (isInstalled, isNotInstalled) {
        console.log('check if db is installed');
        var that = this;

        this.db.transaction(function (tx) {
                tx.executeSql("SELECT * FROM app WHERE name = 'installed'", [],
                    function (tx, results) {
                        var property = that.fixResult(results);
                        console.log("## -- property -- ## ");
                        console.log(property);

                        if ((property && _.has(property, "value"))) {
                            if (property.value == 1) {
                                console.log(property);
                                isInstalled();
                            } else {
                                isNotInstalled();
                            }
                        } else {
                            isNotInstalled();
                        }
                    },

                    isNotInstalled);
            },

            function (err) {
                console.error("[DBSETUP] TX-is broken. couldn't check if table app exists or table is filled with valied values {installed == 1} ");
                that.dbErrorHandler(err);
            }
        );
    };

    /**
     * creates tables based on passed sqls
     *
     * @param sqls {{Array}} of sql
     * @param success callback-function for success
     * @param fail callback-function for error
     */
    Database.prototype.createTable = function (sqls, success, fail) {
        var that = this;

        this.db.transaction(function (tx) {
                if (!_.isArray(sqls)) {
                    console.error("first param:sqls must be an array of query-strings. sqls = " + sqls);
                    return;
                }

                var nsOfQueries = sqls.length;
                var successCounter = 0;

                var doAfterSuccess = function () {
                    successCounter++;
                    console.log("query[" + successCounter + "] exec successful.");


                    if (successCounter == nsOfQueries) {
                        if (success)
                            success();
                        else
                            console.warn("-- Database.createTable(...) has no success-function passed. Skip success-callback.");
                    }
                };

                var doAfterFail = (fail && _.isFunction(fail)) ? fail : that.dbErrorHandler;

                if (_.isArray(sqls)) {
                    _.each(sqls, function (sql) {
                        tx.executeSql(sql, [], doAfterSuccess, doAfterFail);
                        console.log("[DB-SETUP] " + sql);
                    });

                    return;
                }
            },

            that.dbErrorHandler);
    }

    /**
     * speichert ein Objekt in der DB.
     * verwendet die insert()
     *
     * @param table {{String}} never NULL.
     * @param object {{Object}} never NULL.
     * @param success {{Function}}
     */
    Database.prototype.insertObject = function (table, object, success) {
        if (!_.isString(table)) {
            console.error("couldn't insert object. passed table-name (1. param) is not a string.");
            // todo( "Kann nicht in die DB schreiben.");

            return;
        }

        if (!(object && _.isObject(object))) {
            console.error("couldn't insert object. passed object (2. param) is not an object. couldn't store this object in db");
            console.log(object);

            return;
        }

        var params = [];
        var keys = _.keys(object);

        _.each(keys, function (key) {
            var value = object[key];
            params.push({
                name: key,
                value: value
            });
        });

        this.insert(table, params, success);
    };

    /**
     * Hilfsmethode für die Transformation
     *
     * @param object
     */
    Database.prototype.objToParam = function (object) {
        if (!(object && _.isObject(object))) {
            console.error("couldn't insert object. passed object (2. param) is not an object. couldn't store this object in db");
            console.log(object);

            return;
        }

        var params = [];
        var keys = _.keys(object);

        _.each(keys, function (key) {
            var value = object[key];
            params.push({
                name: key,
                value: value
            });
        });

        return params;
    };

    Database.prototype.updateObjectById = function (table, id, object, success) {
        if (!_.isString(table)) {
            console.error("couldn't insert object. passed table-name (1. param) is not a string.");
            return;
        }

        var params = this.objToParam(object);
        this.updateById(table, id, params, success);
    };


    Database.prototype.deleteByMember = function (tables, refId, success, fail) {
        var dbManager = this;

        _.each(tables, function (table) {
            var that = dbManager;
            var sql = deleteSQL(table, (" refId = " + refId));

            if (!sql) {
                console.error("couldn't delete. sql is not generated. table = " + table + ", refId = " + refId);
                return;
            }

            console.log("[DB] " + sql);

            that.db.transaction(
                function (tx) {

                    // rebind var:
                    var db = that;
                    tx.executeSql(sql, [],
                        function (tx, result) {
                            console.log("## deletes successful. table= " + table + " refId = " + refId);
                            if (success)
                                success();
                        },

                        function (err) {
                            console.log("## deletes failed. table= " + table + " refId = " + refId);

                            if (fail)
                                fail(err);
                            else
                                db.dbErrorHandler(err);
                        });

                }, that.dbErrorHandler);
        });
    };

    Database.prototype.deleteById = function (table, id, success, fail) {
        var that = this;

        var sql = deleteSQL(table, (" _id = " + id));

        if (!sql) {
            console.error("couldn't delete. sql is not generated. table = " + table + ", id = " + id);
            return;
        }

        console.log("[DB] " + sql);

        this.db.transaction(
            function (tx) {

                // rebind var:
                var db = that;
                tx.executeSql(sql, [],
                    function (tx, result) {
                        console.log("## deletes successful. table= " + table + " id = " + id);
                        if (success)
                            success();
                    },

                    function (err) {
                        console.log("## deletes failed. table= " + table + " id = " + id);

                        if (fail)
                            fail(err);
                        else
                            db.dbErrorHandler(err);
                    });

            }, that.dbErrorHandler);
    };

    // #####################################################################################
    //                                  SQL-Operations :::
    // #####################################################################################
    Database.prototype.insert = function (table, data, success) {
        var that = this;

        var sql = insertSQL(table, data);
        if (!sql) {
            console.error("couldn't exec INSERT.");
            return;
        }

        console.log("[DB] " + sql);

        this.db.transaction(
            function (tx) {
                tx.executeSql(sql, [],
                    function () {
                        success();
                    },

                    that.dbErrorHandler);
            }, that.dbErrorHandler);
    };

    Database.prototype.updateById = function (table, id, data, success) {
        var that = this;
        delete data._id;

        var sql = updateSQL(table, data, ('_id = ' + id ));
        if (!sql) {
            console.error("couldn't exec UPDATE table '" + table + "'. query not generated.");
            return;
        }

        console.log("[DB] " + sql);

        this.db.transaction(
            function (tx) {
                tx.executeSql(sql, [],
                    function () {
                        success();
                    },

                    that.dbErrorHandler);
            }, that.dbErrorHandler);
    };

    Database.prototype.findAll = function (table, where, success) {
        var that = this;

        var sql = selectSQL(table, where);
        if (!sql) {
            console.error("couldn't exec SELECT. sql not constructed.");
            return;
        }

        console.log("[DB] " + sql);

        this.db.transaction(
            function (tx) {
                tx.executeSql(sql, [],
                    function (tx, results) {
                        var fixed = that.fixResults(results);
                        success(fixed);
                    },

                    that.dbErrorHandler);
            }, that.dbErrorHandler);
    };


    /*
     #####################################################################################
     Converter :
     JS to SQL/DB
     #####################################################################################
     */
    /**
     * @param values das values Object
     * @param dateFieldName der Name des betroffenen Feldes
     */
    Database.prototype.convertDateToSQL = function (values, dateFieldName) {
        var hasDate = (_.has(values, dateFieldName) && values[dateFieldName]);
        if (!hasDate) {
            console.error("couldn't convert (Date)-field '" + dateFieldName + "' to SQL.");
            return;
        }

        var value = values[dateFieldName];
        if (_.isDate(value)) {
            values[dateFieldName] = value.getTime();
        } else if (_.isString(value)) {
            var formatted = moment(value, "DD.MM.YYYY");
            values[dateFieldName] = formatted.toDate().getTime();
        }
    };

    Database.prototype.convertDateTimeToSQL = function (values, dateFieldName) {
        var hasDate = (_.has(values, dateFieldName) && values[dateFieldName]);
        if (!hasDate) {
            console.warn("couldn't convert (Date)-field '" + dateFieldName + "' to SQL.");
            return;
        }

        var value = values[dateFieldName];
        if (_.isDate(value)) {
            values[dateFieldName] = value.getTime();
        } else if (_.isString(value)) {
            var formatted = moment(value, "DD.MM.YYYY HH:mm");
            values[dateFieldName] = formatted.toDate().getTime();
        }
    };

    Database.prototype.convertBooleanToSQL = function (values, fieldName) {
        var has = _.has(values, fieldName);

        if (!has) {
            values[fieldName] = 0;
            return;
        }

        var value = values[fieldName];

        if (_.isBoolean(value)) {
            values[fieldName] = value ? 1 : 0;
            return;
        }

        if (_.isNumber(value) && (value > 0)) {
            console.log("nothing to convert. use original value: " + value);
            return value;
        }

        console.error("couldn't convert value to boolean: " + value);
    };

    // ##################################################################
    //               transform rows to array
    // ##################################################################
    /**
     * @param results {Array} of db-tx-rows
     * @returns {Array} of rows.
     */
    Database.prototype.fixResults = function (results) {
        var rval = [];
        for (var i = 0, len = results.rows.length; i < len; i++) {
            var row = results.rows.item(i);
            rval.push(row);
        }
        return rval;
    }


    Database.prototype.fixResult = function (result) {
        if (result.rows.length) {
            return result.rows.item(0);
        } else
            return {};
    }


    /*
     ############################################################################
     Converter: convert SQL-Values to Objects
     ############################################################################
     */
    /**
     * use to convert values comming from DB to JS.
     * walk over an array of values and call passed callback-method:
     * + mapResult()
     *
     * @param results {{Array}} of results. never NULL.
     * @param mapResult {{Function}} never Null.
     *
     * @returns {{Array}} of mapped objects
     */
    Database.prototype.mapResults = function (results, mapResult) {
        var that = this;

        if (!_.isArray(results)) {
            console.error("fetched results is not an ARRAY.");
            return {};
        }

        var rval = [];

        _.each(results, function (entry) {
            var mapped = mapResult(entry, that);
            rval.push(mapped);
        });

        return rval;
    };

    Database.prototype.asStringDate = function (time) {
        if (!time)
            return time;

        var asDate = new Date(time);
        var converted = moment(asDate).format("DD.MM.YYYY").toString();

        return converted;
    };

    Database.prototype.asDate = function (time) {
        if (!time)
            return time;

        return new Date(time);
    };

    Database.prototype.asBoolean = function (value) {
        if (_.isBoolean(value))
            return value;

        if (_.isNumber(value))
            return (value > 0);

        console.error("BOOLEAN-value is not supported: " + value);
        return null;
    };

    // ##################################################################
    //      OLD Impl.: muss noch aufgeräumte werden.
    // ##################################################################


    Database.prototype.getEntry = function (id, callback) {
        var that = this;
        this.db.transaction(function (tx) {
            tx.executeSql('select id, title, body, image, published from diary where id = ?', [id],
                function (tx, results) {
                    callback(that.fixResult(results));
                }, that.dbErrorHandler);
        }, that.dbErrorHandler);

    };


    Database.prototype.saveEntry = function (data, success) {
        console.log(data);
        var that = this;

        // TODO: Update fehlt.
        this.db.transaction(
            function (tx) {
                tx.executeSql('insert into diary(title,body,published) values(?,?,?)', [data.title, data.body, new Date().getTime()],
                    function () {
                        success();
                    }, that.dbErrorHandler);
            }, that.dbErrorHandler);
    }

    return Database;
});