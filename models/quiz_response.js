//quizjs
var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var QuizResponseSchema = new Schema({
    responder: String,
    email: String,
    responseTo: String,
    answers: {type:Array, "default":[]},
    submitted: String,
    percentage: String
});
//console.log("QUIZ SCHEMA COMIN OUT");
//console.dir(SweetQuizSchema);

module.exports = mongoose.model('QuizResponse', QuizResponseSchema);