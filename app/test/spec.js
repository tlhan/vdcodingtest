
// Tests for error in server launch, expects 200 'OK' for known routes and 404 for a known-unknown routes 

var request = require('supertest');

describe('loading express', function () {
  var server;
  beforeEach(function () {
  delete require.cache[require.resolve('../../app.js')];
  server = require('../../app');
});
  afterEach(function (done) {
    server.close(done);
  });
  it('responds to /', function testSlash(done) {
    request(server)
      .get('/')
      .expect(200, done);
  });
  it('404 everything else', function testPath(done) {
    console.log('test 404')
    request(server)
      .get('/foo/bar') //known route that will give an unknown 404 not found error
      .expect(404, done);
  });
});