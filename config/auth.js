const localv = require("passport-local").Strategy
const mongoose = require("mongoose")
const bcryt = require("bcryptjs")
const  {use}  = require("passport")


//users
require("../models/user")
const user = mongoose.model("usuarios")

module.exports = function(passport){
    passport.use(new localv ({
        usernameField: 'email', passwordField: "senha"
    },(email, senha, done)=>{
        user.findOne({email: email}).then((usuario)=>{
            if(!usuario){
                return done(null, false, {message: "That acount don't exist"})
            }
            bcryt.compare(senha, usuario.senha, (erro, batem)=>{
                if(batem){
                    return done(null, usuario)
                }else{
                    return done(null, false, {message: "Senhas incorreta"})
                }
            })
        })
    }))
    passport.serializeUser((usuario, done)=>{
        done(null, usuario)
    })
    
    passport.deserializeUser((id, done)=>{
        user.findById(id).then((usuario, err)=>{
            done(err, usuario)
        }).catch((err)=>{
            console.log(err)
        })
        })

}