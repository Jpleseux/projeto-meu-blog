const mongoose = require("mongoose")
const Schema = mongoose.Schema;


const imagens = new Schema({
    nome:{type:String, required:true},
    src: {type:String, required: true},
})


module.exports = mongoose.model("imagens", imagens)