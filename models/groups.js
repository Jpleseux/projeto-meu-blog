const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const group = new Schema({
   tema: {
    type: String,
    required: true
   },
   nome: {
    type: String,
    required: true
   },
   data:{
    type: Date,
    default: Date.now()
   },
   group: {
      type: Schema.Types.ObjectId, 
      ref: "imagens",
      required: true
   }

})

mongoose.model('groups', group);