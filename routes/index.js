
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Inquizitor App Home' });
};


/*
 * GET create page.
 */

exports.create = function(req, res){
  res.render('create', { title: 'Create a new quiz' });
};