facade-js
=========

AMD/requireJS based database-facade to handle WebSQL/local for WebApp development easy.
Hides the boilerplate database-code inside an module.

    version: 0.1.2
    author:  Andreas Siebert, ask@touchableheroes.com


## Features

* wraps database access logic
* convert json to sql


## Installation

You needs require-js to use facade-js. After requireJS-project is prepared, download facade-js files and put
them into "facade-js" dir. To understand require-js modules read the manual of require-js.

## Usage

Example how to use facade-js.

```javascript

First of all you need to configure require-js path. Please add all facade-js-dependencies, before you start.

require.config({
    paths: {
        underscore: 'lib/underscore-min',
        stringjs: 'lib/string-min',
        moment: 'lib/moment-min',

        dbEnv: 'lib/facade-js/DbEnv',
        db:  'lib/facade-js/Database',
        dbInstall: 'lib/facade-js/Database-install'
    }
});

An entity-config is a json-object with this structure:
```javascript
        {
            "table": "<table-name>",
            "columns": [
                {
                    "name": "<column-name>",
                    "type": "<column-type>"
                }
            ]
        }
```

A valid example (Primary-key and index is not supported at this moment.):
```javascript
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
```

```javascript
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

        function () {
                console.log("db initialization forced.");
        });
    });
```


## Supported backends

- WebSQL - Browser-Database.
- SQLite-Plugin - PhoneGap Plugin for Database-access on smartphones.


## License

The MIT License (MIT)

Copyright (c) 2013 Andreas Siebert

Permission is hereby granted, free of charge, to any person obtaining a copy of
this software and associated documentation files (the "Software"), to deal in
the Software without restriction, including without limitation the rights to
use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of
the Software, and to permit persons to whom the Software is furnished to do so,
subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS
FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER
IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## Conclusion

...


have fun and write code!
drdrej aka Andreas Siebert, ask@touchableheroes.com