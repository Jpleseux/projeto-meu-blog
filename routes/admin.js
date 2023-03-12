const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const AdminController = require('../controllers/AdminController/AdminController')
require('../models/Categoria')
const Categoria = mongoose.model("categorias")
require('../models/posts')
const Postagem = mongoose.model('postagens')
const {eAdmin}= require("../helpers/eAdmin")
const picture = require("../controllers/pictureController")
const upload = require("../config/multer")
require("../models/imgs")
const pictures = mongoose.model("imagens")
const fs = require("fs")
require("../models/user")
const users = mongoose.model("usuarios")
const mime = require("mime-types")
const path = require('path')

router.get('/', eAdmin, (req, res)=>{
    res.render("admin/index")
})
router.get('/posts',eAdmin,  (req, res)=>{
    res.send("Pagina de posts")
})

// AdminController.editCategory

router.get('/categorias',eAdmin, (req, res)=>{
    Categoria.find().lean().sort({date: 'desc'}).then((Categoria)=>{
        res.render('admin/categorias', {categorias: Categoria})
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao listar categorias")
        res.redirect('/admin')
    })
})

router.get('/categorias/add',eAdmin,  (req, res)=>{
    res.render('admin/addcategorias')
})
router.get("/categorias/edit/:id", eAdmin, (req, res)=>{
    Categoria.findOne({_id:req.params.id}).lean().then((categoria)=>{
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err)=>{
        res.flash("error_msg", "Esta categoria não existe")
        res.redirect('/admin')
    })
})
router.post('/categorias/edit', eAdmin, (req, res)=>{
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {
        erros = []

        if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
            erros.push({ texto: "Nome invalido" })
        }
        if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
            erros.push({ texto: "Slug invalido" })
        }
        if (req.body.nome.length < 2) {
            erros.push({ texto: "Nome da categoria muito pequeno" })
        }
        if (erros.length > 0) {
                res.render("admin/editcategorias", {erros: erros, categoria: categoria})
            
        } else {
            categoria.nome = req.body.nome
            categoria.slug = req.body.slug

            categoria.save().then(() => {
                req.flash("success_msg", "Categoria editada com sucesso!")
                res.redirect("/admin/categorias")
            }).catch((err) => {
                req.flash("error_msg", "Erro ao salvar a edição da categoria")
                res.redirect("admin/categorias")
            })

        }
    }).catch((err) => {
        console.log(err);
        req.flash("error_msg", "Erro ao editar a categoria")
        res.redirect("/admin/categorias")
    })
})
router.post('/categorias/nova', eAdmin, (req, res)=>{

    var erros = []
    if(!req.body.nome || typeof req.body.nome == undefined ||req.body.nome == null){
        erros.push({texto: "Nome inválido"})
    }

    if(!req.body.slug ||typeof req.body.slug == undefined ||req.body.slug == null){
        erros.push({texto: "Slug inválido"})
    }
    if(erros.length > 0){
        res.render("admin/addcategorias", {erros: erros})
    }else{
        const novaCategoria= {
            nome: req.body.nome,
            slug: req.body.slug
        }
        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "ocorreu um erro tente novamente!!")
            res.redirect('/admin')
        })
    }
})
router.post('/categorias/deletar', eAdmin, (req, res)=>{
    Categoria.deleteOne({_id: req.body.id}).then(()=>{
        req.flash("success_msg", "Categoria deleada com sucesso")
        res.redirect('/admin/categorias')
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao deletar a categoria")
        res.redirect('/admin/categorias')
    })
})

router.get("/postagens",eAdmin, (req, res)=>{
    Postagem.find().lean().populate("categoria").sort({data: 'desc'}).then((postagens)=>{
        users.findById({_id: req.user._id}).lean().then((user)=>{
            res.render("admin/postagens", {postagens: postagens, usuario: user})
        }).catch((err)=>{
            req.flash("error_msg", "Erro ao listar postagens")
            console.log(err)
        })



        // users.findOne({_id: req.user._id}).lean().then((usuario)=>{
        //     res.render("admin/postagens", {postagens: postagens, usuario: usuario})
        // }).catch((err)=>{
        //     console.log(err)
        // })
    }).catch((err)=>{
        console.log(err)
        req.flash("error_msg", "houve erro para exibir post")
        res.redirect("/admin")
    })
})
router.get("/postagens/add",eAdmin,  (req, res)=>{
    Categoria.find().lean().then((categorias)=>{
        res.render("admin/addpostagens", {categorias: categorias})
    }).catch((err)=>{
        req.flash('error_msg', "Erro ao carregar formulário")
        res.redirect('/admin')
    })
})

router.post('/postagens/nova',upload.single("file"), eAdmin,async (req, res)=>{
    var erros = []
        var file = req.file
        var tipos = 0
        var rota = file.path
        var mimetype = mime.lookup(file.path)
        if(mimetype.toString().includes('image')){
            tipos = 1
        }else if(mimetype.toString().includes("video")){
            tipos = 2
        }else{
            tipos = 3
        }
        var {filename} = file;
  
        // const picture = new pictures({
        //   nome: filename,
        //   src: file.path
        // })

    if(req.body.categoria == '0'){
        erros.push({texto: "categoria inválida, registre uma categoria"})
    }
    if(erros.length > 0){
        res.render('admin/postagem', {erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            Slug: req.body.slug,
            img: filename,
            src: rota,
            tipo: tipos,
            user: req.user.nome
        }
        new Postagem(novaPostagem).save().then(()=>{
            req.flash("success_msg", 'Postagem críada com sucesso')
            res.redirect("/admin/postagens")
        }).catch((err)=>{
            console.log(err)
            req.flash('error_msg', "erro ao salvar postagem")
            res.redirect('/admin/postagens')
        })
    }
})
router.get('/postagens/edit/:id', eAdmin, (req, res)=>{
    Postagem.findOne({_id: req.params.id}).lean().then((postagem)=>{
        Categoria.find().lean().then((categorias)=>{
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        }).catch((err)=>{
            req.flash('error_msg', 'Houve um erro ao listar categorias')
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg", "houve um erro ao editar o formulário")
        res.redirect("/admin")
    })
})

router.post("/postagem/edit", eAdmin, upload.single("file"), (req, res)=>{
    Postagem.findOneAndUpdate({_id: req.body.id}).then((postagem)=>{       
     
        // var file = req.file
        // var tipos = 0
        // var rota = file.path
        // var mimetype = mime.lookup(file.path)
        // if(mimetype.toString().includes('image')){
        //     tipos = 1
        // }else if(mimetype.toString().includes("video")){
        //     tipos = 2
        // }else{
        //     tipos = 3
        // }
        // var {filename} = file;

        // postagem.img = filename
        // postagem.src = rota
        // postagem.tipo = tipos
        postagem.titulo= req.body.titulo
        postagem.Slug= req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(()=>{
            req.flash("success_msg", "postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err)=>{

            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao salvar a postagem")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/deletar", eAdmin, (req, res)=>{
    const src = req.body.src
    Postagem.deleteOne({_id: req.body.id}).then(()=>{
        fs.unlinkSync(src)
        req.flash("success_msg", "Categoria deleada com sucesso")
        res.redirect('/admin/postagens')
    }).catch((err)=>{
        req.flash("success_msg", "Falha interna")
    })
})
module.exports = router


// {_id: req.body.id},
// { $set:
//     {
//         "titulo" : req.body.titulo,
//         "slug" : req.body.slug,
//         "descricao" : req.body.descricao,
//         "conteudo" : req.body.conteudo,
//         "categoria" : req.body.categoria
//     }
// } 
// , () => {})