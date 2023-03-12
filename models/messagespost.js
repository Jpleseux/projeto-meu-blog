const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const coments =  new Schema({
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
        ref: "postagens",
        required: true
      }
})

mongoose.model("coments", coments)