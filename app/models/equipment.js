var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var EquipmentSchema = new Schema({
  etype: {type:String, required:true},
  tagNumber:  {type:String, required:true, select:true, index: {unique:true}},
  make: String,
  model: String,
  serial: String,
  purchaseDate: {type:Date, default: Date.now},
  purchaseLocation: String,
  purchasePriceUSD: Number,
  assignedTo: {type:Schema.Types.ObjectId, ref:'User'},
  status: String,
  description: String,
  history:String,
  lastModifiedDate: {type:Date, default: Date.now},
  created: {type:Date, default: Date.now}
});

EquipmentSchema.pre('save', function(next){
  var eq = this;
  var history = "Attributes Changed: ";
  if (eq.isModified('etype'))
    history += "etype:" + eq.etype + ",";

  if (eq.isModified('make'))
    history += "make:" + eq.make + ",";

  if (eq.isModified('model'))
    history += "model:" + eq.model + ",";

  if (eq.isModified('serial'))
    history += "serial:" + eq.serial + ",";

  if (eq.isModified('tagNumber'))
    history += "tagNumber:" + eq.tagNumber + ",";

  if (eq.isModified('purchasePriceUSD'))
    history += "purchasePriceUSD:" + eq.purchasePriceUSD + ",";

  if (eq.isModified('assignedTo'))
    history += "assignedTo:" + eq.assignedTo + ",";

  if (eq.isModified('status'))
    history += "status:" + eq.status + ",";

  eq.history += history+"\n"
  lastModifiedDate = Date.now();

  return next();
});

module.exports = mongoose.model('Equipment', EquipmentSchema);
