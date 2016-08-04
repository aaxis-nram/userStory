var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var StorySchema = new Schema({
  creator: {type:Schema.Types.ObjectId, ref:'User' },
  title: {type:String,select: true},
  content: {type:String,select: true},
  created: {type:Date, default: Date.now}
});

module.exports = mongoose.model('Story', StorySchema);
