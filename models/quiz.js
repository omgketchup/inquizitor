//quizjs
var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var SweetQuizSchema = new Schema({
    name: String,
    type: String,
    description: String,
    thankyou: String,
    advancedOptions: {},
    questions: {type:Array, "default":[]},
    created: String,
    author: String,
    numba: String
});
//console.log("QUIZ SCHEMA COMIN OUT");
//console.dir(SweetQuizSchema);

module.exports = mongoose.model('SweetQuiz', SweetQuizSchema);