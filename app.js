// call the packages we need
var express     = require('express');        // call express
var app         = express();                 // define our app using express
var bodyParser  = require('body-parser');    // this will help with post requests
var mongoose    = require('mongoose');       // mongoDB node package
var Cat        = require('./app/models/cat'); 
var timestamp   = require('unix-timestamp'); 

timestamp.round = true; // rounds out unix-time output and removes trailing decimals

//mongoose.connect("mongodb://localhost/cats");
mongoose.connect("mongodb://tlhan:12345@ds119476.mlab.com:19476/codingtest");

// configure app to use bodyParser()
// this will let us get the data from a POST
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080;        // set our port

// ROUTES FOR OUR API
// =============================================================================
var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening...');
    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });   
});

// more routes for our API will happen here

// on routes that end in /cats
// ---------------------------------------------------
router.route('/cats')

    // create a cat (accessed at POST https://vaultdragon-tlhan.c9users.io/api/cats)
    .post(function(req, res){
        var cat = new Cat(); // create a new instance of the Cat model
        cat.name = req.body.name; // set the cats key (comes from the request)
        cat.age = req.body.age // set the cats value (comes from the request body)
        cat.timestamp = timestamp.now(); // set the current time as UNIX time
        // save the cat and check for errors
        cat.save(function(err){
            if(err)
                res.send(err);
                
            res.json(cat);
        });
    })
    
    // get all the cats (accessed at GET https://vaultdragon-tlhan.c9users.io/api/cats)
    .get(function(req, res) {
        //console.log('timestamp: ' + req.query.timestamp)
        Cat.find(function(err, cats) {
            if (err)
                res.send(err);
                
            res.json(cats);
        });
    });
    
// on routes that end in /cats/:cat_id
// -----------------------------------------------
router.route('/cats/:cat_name')

    //get the cat with that id (accessed at GET https://vaultdragon-tlhan.c9users.io/api/cats/:cat_id)
    .get(function(req, res) {
        if (req.query.timestamp==undefined)
        {
            Cat.findByName(req.params.cat_name, function(err, cat){
                if (err)
                    res.send(err);
                    
                res.json({ Age:  + cat[0].age});
            }).sort({ timestamp: -1 }).limit(1);
        }
        else {
            Cat.find({timestamp: {$lte: req.query.timestamp}}, function (err, cat) {
              if (err)
                res.send(err);
                
                res.json({ Age:  + cat[0].age});
            }).sort({ timestamp: -1 }).limit(1)
        }
            
    })
    
    // update the cat with this id (accessed at PUT https://vaultdragon-tlhan.c9users.io/api/cats/:cat_id)
    .post(function(req, res) {
        
        // use our cat model to find the cat we want
        Cat.findById(req.params.cat_id, function(err, cat){
            if(err)
                res.send(err);
            
            cat.name = req.body.name; //update the cats info
            
            //save the cat
            cat.save(function(err){
                if(err)
                    res.send(err);
                
                res.json({ message: 'Cat updated!'});
            });
        });
    })
    
    // delete the cat with this id (accessed at DELETE https://vaultdragon-tlhan.c9users.io/api/cats/:cat_id)
    .delete(function(req, res)
    {
        Cat.remove({
            _id: req.params.cat_id
        }, function(err, cat) {
            if(err)
                res.send(err);
            
            res.json( {message: 'Successfully deleted'});
        });
    });

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
