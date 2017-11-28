var mongoose     = require('mongoose');
var Schema       = mongoose.Schema;

var CatSchema   = new Schema({
	name: { type: String, required: [true, 'Every cat needs a name']},
	age: Number,
	timestamp: Number
});

CatSchema.static('findByName', function (name, callback) {
  return this.find({ name: name }, callback);
});

module.exports = mongoose.model('Cat', CatSchema);