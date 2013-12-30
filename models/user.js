//quizjs
var mongoose = require('mongoose')
    , Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: String,
    pass: String,
    created: String
});
//console.log("QUIZ SCHEMA COMIN OUT");
//console.dir(SweetQuizSchema);

module.exports = mongoose.model('User', UserSchema);