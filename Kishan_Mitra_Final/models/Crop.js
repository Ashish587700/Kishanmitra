const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  name: String,
  quantity: Number,
  price: Number,
  condition: String,
  available : Boolean, 
  description: String,  
  image: String, 
  // farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
  farmerId: String

});

module.exports = mongoose.model('Crop', cropSchema);
