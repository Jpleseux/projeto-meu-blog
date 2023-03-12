const mongoose = require('mongoose')
require('../../../models/Categoria')
const Categoria = mongoose.model("categorias")

module.exports = {
    getCategoris: async ()=> {
        Categoria.find().lean().sort({date: 'desc'}).then((Categoria)=>{
            return Categoria;
        }).catch((err)=>{
            return [];
        })
    }
}