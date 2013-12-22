//quizjs
var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var SweetQuizSchema = new Schema({
    name: String,
    questions: [String],
    created: String,
    author: String
});
//console.log("QUIZ SCHEMA COMIN OUT");
//console.dir(SweetQuizSchema);

module.exports = mongoose.model('SweetQuiz', SweetQuizSchema);