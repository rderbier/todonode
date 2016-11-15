// server.js

    // set up ========================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var seraph = require('seraph');                     // mongoose for mongodb
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)


    
    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());

    // configuration =================
url = require('url').parse(process.env.GRAPHENEDB_URL);
console.log("Using Graph DB at "+url);
var db = require("seraph")({
  server: url.protocol + '//' + url.host,
  user: url.auth.split(':')[0],
  pass: url.auth.split(':')[1]
});
    // listen (start app with node server.js) ======================================
    app.listen(8080);
    console.log("App listening on port 8080");

    // routes ======================================================================

    // api ---------------------------------------------------------------------
    // get all todos
    app.get('/api/todos', function(req, res) {

        // use seraphto get all todos in the database
        db.find({}, 'TODO', function(err, todos) {
  if (err)
      res.send(err)
  res.json(todos);
  
  console.log(todos);
});
    });



    // create todo and send back all todos after creation
    app.post('/api/todos', function(req, res) {

        // create a todo, information comes from AJAX request from Angular
        db.save({
            description : req.body.text,
            done : false
        },'TODO', function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            db.find({},"TODO",function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
        });

    });

    // delete a todo
    app.delete('/api/todos/:todo_id', function(req, res) {
    	console.log("deleting node "+req.params.todo_id);
        db.delete(req.params.todo_id
            , function(err) {
            if (err)
                res.send(err);

            // get and return all the todos after you create another
            db.find({},"TODO",function(err, todos) {
                if (err)
                    res.send(err)
                res.json(todos);
            });
        });

    });
    // application -------------------------------------------------------------
    app.get('*', function(req, res) {
        res.sendfile('./public/index.html'); // load the single view file (angular will handle the page changes on the front-end)
    });
