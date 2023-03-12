const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const Postagem = new Schema({
    titulo:{
        type: String,
        required: true
    }, 
    Slug:{
        type: String,
        required: true
    },
    descricao: {
        type: String,
        required: true
    },
    conteudo: {
        type: String,
        required: true
    },
    categoria:{
        type: Schema.Types.ObjectId,
        ref: "categorias", 
        required: true
    },
    data:{
        type: Date,
        default: Date.now()
    },
    img:{
        type: String,
        required: false
    },
    src:{
        type:String,
        required: false
    },
    tipo:{
        type: String,
        required: true
    },
    user:{
        type: String,
        required: true
    } 
    // message:{
    //     type: String,
    //     required: true
    // },
    // user: {
    //     type: String,
    //     required: true
    // }
})

mongoose.model("postagens", Postagem)