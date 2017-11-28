// call the packages we need
var express     = require('express');            // call express
var app         = express();                     // define our app using express
var bodyParser  = require('body-parser');        // this will help with post requests
var mongoose    = require('mongoose');           // mongoDB node package
var Cat         = require('./app/models/cat');    // our cat schema object
var timestamp   = require('unix-timestamp');    //epoch unix time

//db options 
var options = { server: { socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } }, 
                replset:{ socketOptions: { keepAlive: 1, connectTimeoutMS : 30000 } } 
              }; 

timestamp.round = true; // rounds out unix-time output and removes trailing decimals

//mongoose.connect("mongodb://localhost/cats");
mongoose.connect("mongodb://tlhan:12345@ds119476.mlab.com:19476/codingtest", options);

// configure app to use bodyParser()
// this will let us send JSON to a GET
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log("Router is processing " + req.method + " " + req.url);
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://thant.rocks/)
router.get('/', function(req, res) {
    res.send("<title>VD Coding Test</title><h1> Vault Dragon API Coding Submission</h1><div>Cat Object Schema: </div><ul><li>name: String</li><li>age: Number</li><li>timestamp: Number (no need to POST this)</li></ul><div>Calling the API: </div><ul style='list-style-type:square'><li><u>POST</u> requests at /cats</li><div><li><u>GET</u> requests at /cats/(cat name) and /cats/(cat name)?timestamp=(timestamp)</li></ul>");   
});


// on routes that end in /cats
// ---------------------------------------------------
router.route('/cats')

    // create a cat (accessed at POST http://thant.rocks/cats)
    .post(function(req, res){
        var cat = new Cat(); // create a new instance of the Cat model
        cat.name = req.body.name; // set the cats key (comes from the request)
        cat.age = req.body.age // set the cats value (comes from the request body)
        cat.timestamp = timestamp.now(); // set the current time as UNIX time
        
        // ----Input sanitization----
        // If cat's age is not null, a number, less than 20 -- accept the input. 
        // Otherwise reject 

        // Alphanumeric input cross check variable for name input sanitization
        var letters = /^[0-9a-zA-Z ]+$/; 
        
        if (!isNaN(req.body.age) && req.body.age && req.body.age<=20 && req.body.age>=0) {
            // not really clean coding practice to have another nested if condition in general but this will do for now
            // cat must not be null, is alphanumeric, less than 15 characters in length
            if(req.body.name && req.body.name.match(letters) && req.body.name.length<15) { 
                // when the conditions are met, save the cat and check for errors
                cat.save(function(err){
                    if(err)
                        res.send(err);
                        
                    res.json({ 
                        name: cat.name,
                        age: cat.age,
                        timestamp: cat.timestamp
                    });
                });
            }
            else {
                res.send("You must input a name for the cat. It also cannot contain dashes, underscores or any other special characters. The name also has to be less than 15 characters.");
            }
        }
        else {
            res.send("Invalid cat attributes. Please make sure the cat has a name and age with numbers accepted for cat age from 0-20.");
        }
    })
    
    // get all the cats (accessed at GET http://thant.rocks/cats)
    .get(function(req, res) {
        Cat.find(function(err, cats) {
            if (err)
                res.send(err);
                
            res.json(cats);
        });
    });
    
// on routes that end in /cats/:cat_name
// -----------------------------------------------
router.route('/cats/:cat_name')

    //get the cat with that name (accessed at GET http://thant.rocks/cats/:cat_name)
    .get(function(req, res) {
        if (req.query.timestamp==undefined)
        {
            Cat.findByName(req.params.cat_name, function(err, cat){
                if (err)
                    res.send(err);
                    
                if(Object.keys(cat).length==0) //If no cat exists with that name
                    res.send("Error: No cats exist with that specified name! Note that cat names are case sensitive.")
                else
                    res.json({ Age: + cat[0].age });
            }).sort({ timestamp: -1 }).limit(1);
        }
        else {
            Cat.find({timestamp: {$lte: req.query.timestamp}}, function (err, cat) {
                
               if(err) 
                   res.send(err); 
              
                if(Object.keys(cat).length==0) //If timestamp earlier than the earliest timestamp is chosen
                    res.send("Error: No cats exist before the specified timestamp!")
                else
                    res.json({ Age: + cat[0].age });
                
            }).sort({ timestamp: -1 }).limit(1)
        }
    });

//Exception catch for unspecified wildcard routes
router.get('/*', function(req, res) {
    res.status(404).send("Page not found");
});

// REGISTER OUR ROUTES -------------------------------
// all of our routes will run on root path /
app.use('/', router);

// START THE SERVER and export for tests
// =============================================================================
var server = app.listen(port, function (){
    console.log("App listening at port " + port)
});

module.exports = server;
