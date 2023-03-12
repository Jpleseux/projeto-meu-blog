const express = require("express")
const router = express.Router()
const http = require("http").createServer(router)
const mongoose = require("mongoose")
require("../models/user")
const usuario = mongoose.model("usuarios")
const bcrypt = require("bcryptjs")
const passport = require("passport")
const {eAdmin} = require("../helpers/eAdmin")
require("../models/mensagens")
const Message = mongoose.model("Message")
const io = require("socket.io")(http)


// io.on('connection', socket => {
//     console.log('Novo usuário conectado');
  
//     socket.on('coment', data => {
//       const message = new Message(data);
//       message.save().then(()=>{
//         io.emit('coment', data);
//       }).catch((err)=>{
//         console.log(err)
//       })

//       });
//     });


router.get('/', (req, res)=>{
    // console.log(req.session)
    console.log(req.passport.user.nome)
})
router.get("/registro", (req, res)=>{
    res.render("usuarios/registro")
})
router.post("/registro", (req, res)=>{
    var erros = []
    var nome = req.body.nome
    var email = req.body.email
    var senha = req.body.senha
    var senha2 = req.body.senha2
    
    if(!nome || typeof nome == undefined || nome == null){
        erros.push({texto: "Nome inválido"})
    }
    if(!email || typeof email== undefined || email == null){
        erros.push({texto: "email inválido"})
    }
    if(!senha || typeof senha == undefined || senha == null){
        erros.push({texto: "Senha inválido"})
    }
    if(senha.length < 4){
        erros.push({texto: "Senha muito pequena"})
    }
    if(senha != senha2){
        erros.push({texto: "As senhas não se coicidem, escreva de novo ;)"})
    }
    if(erros.length> 0){
        res.render("usuarios/registro", {erros: erros})
    }else{
        usuario.findOne({email: req.body.email}).lean().then((usuarios)=>{
            if(usuarios){
                req.flash("error_msg","Email já existente no banco de dados" )
                res.redirect("/users/registro")
            }else{
                const novouUser = new usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })

                bcrypt.genSalt(10, (erro, salt)=>{
                    bcrypt.hash(novouUser.senha, salt, (erro, hash)=>{
                        if(erro){
                            req.flash("error_msg", "Erro durante o salvamento do usuario")
                            res.redirect("/")
                        }
                        novouUser.senha = hash

                        novouUser.save().then(()=>{
                            req.flash("success_msg", "cadastrado com sucesso")
                            res.redirect("/")
                        }).catch((err)=>{
                            req.flash("error_msg", "Erro ao cadastrar")
                            res.redirect("/")
                        })
                    })
                })
            }
        }).catch((err)=>{
            res.flash("error_msg", "Erro ao interno")
            res.redirect("/")
        })
    }
    // if(!senha2 || typeof senha2 == undefined || senha2 == null){
    //     erros.push({texto: "Senha inválido"})
    // }
})
router.get("/login", (req, res)=>{
    res.render("usuarios/login")
})

router.post("/login", (req, res, next)=>{
    passport.authenticate("local", {
        successRedirect: "/home",
        failureRedirect: "/users/login",
        failureFlash: true
    })(req, res, next)
})
router.get("/logout", (req, res)=>{
    req.logOut((err)=>{
        req.flash("success_msg", "Deslogado com sucesso")
        res.redirect("/")
    })
})
router.post("/group/deletar/:id", (req, res)=>{
    Message.deleteMany().populate("chat").then((msg)=>{
        req.flash("success_msg", "Grupo deletado com sucesso")
        res.redirect(req.headers.referer)
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg", "Erro ao deletar")
        res.redirect(req.headers.referer)
    })
})


module.exports = router