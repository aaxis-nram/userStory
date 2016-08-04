var User = require("../models/user");
var Story = require("../models/story");
var config = require("../../config");

var secretKey = config.secretKey;
var jsonwebtoken = require('jsonwebtoken');

//Create Token function
function createToken(user) {
  var token = jsonwebtoken.sign({
    _id: user._id,
    name: user.name,
    username: user.username
  }, secretKey, {
    expiresIn: 3600
  });

  return token;
}


module.exports = function(app, express, io) {
  var api = express.Router();

  api.get('/allStories', function(req, res) {
    Story.find({}, function (err, stories) {
      if (err) {
        res.send(err);
        return;
      }

      res.json(stories);
    });
  });

  api.post('/signup', function(req, res){
    var user = new User({
      name: req.body.name,
      username: req.body.username,
      password: req.body.password
    });

    var token = createToken(user);

    user.save(function(err) {
      if (err) {
        res.send(err);
        return;
      }

      res.json({
        success: true,
        message: 'User has been created',
        token: token
      });
    });
  });

  api.get('/users', function(req,res){
    User.find({}, function(err, users) {
      if (err) {
        res.send(err);
        return;
      }
      res.json(users);
    });
  });

  api.post('/login', function(req, res){
    User.findOne({
      username:req.body.username
    }).select('name username password').exec(function(err, user) {
      if (err) throw err;

      if (!user) {
        res.send({message:'username or password incorrect.'});
      } else if (user){
        console.log("Password:" + req.body.password);
        console.log("DB Pass: " + user.password);
        console.log("Name: " + user.name);
        console.log("Username: " + user.username);

        var validPassword = user.comparePassword(req.body.password);

        if (!validPassword){
          res.send({message:'username or password incorrect'});
        } else {
          /// Create token
          var token = createToken(user);
          res.json({
            success: true,
            message: "Successfully logged in!",
            token: token
          });
        }
      }
    });
  }); // End of login api

  // Middleware protected
  api.use(function(req, res, next) {
    console.log("App entry");

    // Get tokens for any of
    var token = req.body.token || req.param('token') || req.headers['x-access-token'];

    if (token) {
      jsonwebtoken.verify(token, secretKey, function(err, decoded){
        if (err) {
          res.status(403).send({success: false, message:"Failed to authenticate user"});
        } else {
          req.decoded = decoded;
          next();
        }
      });
    } else {
      res.status(403).send({success: false, message:"No token found."});
    }
  });

  // Below this point requires a token
  api.get('/home', function(req, res) {
    console.log(req.decoded);
    res.json({message: "Hello World!"});
  });

  api.route('/')
    .post(function(req, res){
      var story = new Story({
        creator: req.decoded._id,
        title: req.body.title,
        content:req.body.content
      });
      story.save(function(err, newStory){
        if (err) {
          res.send(err);
          return;
        }
        io.emit('story', newStory);
        res.json({message: "New story created."});

      });
    })
    .get(function(req, res){
      Story.find({creator: req.decoded._id}, function(err, stories){
          if (err) {
            res.send(err);
            return;
          }
          res.json(stories);
      });

    });

    api.get('/me', function(req, res){
      res.json(req.decoded);
    })
    return api;

} // end of module
