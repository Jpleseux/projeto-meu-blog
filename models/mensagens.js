const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const messageSchema = new Schema({
  message:{
    type: String,
    required: true
  },
  user: {
    type: String,
    required: true
  },
  chat:{
    type: Schema.Types.ObjectId,
    ref: "groups",
    required: true
  }
  // img:{
  //   type: String,
  //   requires: true
  // }
  
});

mongoose.model('Message', messageSchema);
