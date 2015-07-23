var express = require('express');
var router = express.Router();
var db = require('monk')(process.env.MONGOLAB_URI || 'localhost/articles')
var articles = db.get('articles')
require('dotenv').load()

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('/articles');
});

router.get('/articles', function (req,res,next) {
  articles.find({},{sort: {date: -1}}).then(function (articles) {
    res.render('articles', {articles: articles, pageTitle: "Articles"})
  })
})

router.get('/articles/new', function (req, res, next) {
  res.render('new', {pageTitle: "New Article"})
})

router.post('/articles', function (req, res, next) {
  if(validation(req.body).length > 0) {
    res.render('new', {errors: validation(req.body), pageTitle: "New Article"})
  } else {
    var article = req.body
    if (req.body.dark) {
      article.color = 'white';
    } else {
      article.color = 'black';
    }
    article.date = Date.now()
    articles.insert(article).then(function () {
      res.redirect('/articles')
    })
  }
})

router.get('/articles/:id',function (req, res, next) {
  articles.findOne({_id: req.params.id}).then(function (article) {
    article.articlep= article.article.split('\r\n\r')
    res.render('show', {article: article, pageTitle: article.title})
  })
})

router.get('/articles/:id/edit', function (req, res, next) {
  articles.findOne({_id: req.params.id}).then(function (article) {
    res.render('edit', {article: article, pageTitle: "Edit "+article.title})
  })
})

router.post('/articles/:id', function (req, res, next) {
  if(validation(req.body).length > 0) {
    articles.findOne({_id: req.params.id}).then(function (article) {
      article.errors = validation(req.body)
      res.render('edit', {article: article, pageTitle: "Edit "+article.title})
    })
  } else {
    var article = req.body
    if (req.body.dark) {
      article.color = 'white';
    } else {
      article.color = 'black';
    }
    article.date = Date.now()
    articles.update({_id: req.params.id}, article).then(function (article) {
      res.redirect('/articles/'+req.params.id)
    })
  }
})

router.post('/articles/:id/delete', function (req, res, next) {
  articles.remove({_id: req.params.id}).then(function () {
    res.redirect('/articles');
  })
})

var validation = function(body) {
  var errors = []
  if (body.title.trim() === "") {
    errors.push("Title cannot be empty")
  }
  if (body.excerpt.trim() === "") {
    errors.push("Excerpt cannot be empty")
  }
  if (body.article.trim() === "") {
    errors.push("Body cannot be empty")
  }
  console.log(errors)
  return errors
}

module.exports = router;
