var User = require("../models/user");
var Story = require("../models/story");
var Equipment = require("../models/equipment");
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
      if (err)
        throw err;

      if (!user) {
        res.send({message:'username or password incorrect.'});
      } else if (user) {
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

  // Story routing
  api.route('/story')
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

    // Equipment routing
    api.post('/createEquipment', function (req, res) {
      var history = Date.now + "\t"+req.decoded.username+"\tEntry created.";
      var equipment = new Equipment({
          etype: req.body.etype,
          make: req.body.make,
          model: req.body.model,
          serial: req.body.serial,
          tagNumber: req.body.tagNumber,
          purchaseDate: req.body.purchaseDate,
          purchaseLocation: req.body.purchaseLocation,
          purchasePriceUSD: req.body.purchasePriceUSD,
          assignedTo: req.body.user_id,
          status: req.body.status,
          description: req.body.description,
          history: history
        });

        console.log('Attempting to save equipment.');
        equipment.save(function(err) {
          if (err) {
            res.send(err);
            return;
          }

          res.json({success: true, message: "Equipment entry created"});

        });
    });

    api.post('/updateEquipment', function (req, res) {
      var history = Date.now + "\t"+req.decoded.username+"\tEntry updated.";

      Equipment.findOne({
        tagNumber:req.body.originalTagNumber
      }, function (err, eqp){
        if (err) {
          res.send(err);
          return;
        }

        eqp.tagNumber = req.body.tagNumber,
        eqp.etype = req.body.etype,
        eqp.make = req.body.make,
        eqp.model = req.body.model,
        eqp.serial = req.body.serial,
        eqp.purchaseDate = req.body.purchaseDate,
        eqp.purchaseLocation = req.body.purchaseLocation,
        eqp.purchasePriceUSD = req.body.purchasePriceUSD,
        eqp.assignedTo = req.body.user_id,
        eqp.status = req.body.status,
        eqp.description = req.body.description,
        eqp.history += history
        eqp.save(function(err) {
          if (err) {
            res.send(err);
            return;
          }

          res.json({success: true, message: "Equipment entry updated"});
        });
      });
    });

    api.get('/getEquipment', function(req, res){
      Equipment.findOne({
        tagNumber:req.query.tagNumber
      }).select('etype make model serial tagNumber purchaseDate purchaseLocation purchasePriceUSD assignedTo status description history').exec(function(err, eqp) {
        if (err) throw err;

        if (!eqp) {
          res.send({message:'Equipment id not found.'});
        } else if (eqp) {
          res.json(eqp);
        }
      });
    });

    api.get('/listEquipment', function(req, res) {
      Equipment.find({}, function(err, equipmentList){
          if (err) {
            res.send(err);
            return;
          }
          res.json(equipmentList);
      });
    });

    api.get('/me', function(req, res){
      res.json(req.decoded);
    })
    return api;

    // New v1 api

} // end of module
