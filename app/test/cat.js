//run with Mocha

//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

var mongoose = require("mongoose");
var Cat = require('../models/cat');

//Require the dev-dependencies
var chai = require('chai');
var chaiHttp = require('chai-http');
var server = require('../../app.js');
var should = chai.should();

chai.use(chaiHttp);

//Our parent block
describe('Cats', () => {
    beforeEach((done) => { //Before each test we empty the database
        Cat.remove({}, (err) => { 
        done();         
    });    
        
});
/*
  * Test the /GET route
  */
  describe('/GET cats', () => {
      it('it should GET all the cats', (done) => {
        chai.request(server)
            .get('/cats')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(0);
              done();
            });
      });
  });
  
  describe('/POST book', () => {
      it('POSTING a letter in cat age key', (done) => {
        var cat = {
            name: "Kitty Lord",
            age: "letters"
        }
        chai.request(server)
            .post('/cats')
            .send(cat)
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('object');
                res.body.should.have.property('errors');
                res.body.errors.should.have.property('age');
                res.body.errors.name.should.have.property('kind').eql('Number');
              done();
            });
      });
    });
    
     it('it should POST a cat ', (done) => {
        var cat = {
            name: "Kitty Overlord",
            age: "2"
        }
        chai.request(server)
            .post('/cats')
            .send(cat)
            .end((err, res) => {
                res.should.have.status(200);
                //res.body.should.be.a('object');
                //res.body.should.have.property('message').eql('Book successfully added!');
                res.body.book.should.have.property('name');
                res.body.book.should.have.property('age');
                res.body.book.should.have.property('timestamp');
                done();
            });
      });

});