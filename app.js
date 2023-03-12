//modulos       
const express = require('express')
const handlebars = require('express-handlebars')
const bodyparser = require('body-parser')
//const mongoose = require('mongoose')
const app = express()
const admin = require('./routes/admin')
const path = require('path')
const passport =  require("passport")
require("./config/auth")(passport)
const session = require("express-session")
const MongoStore = require("connect-mongo")(session)
const { default: mongoose } = require('mongoose')
const flash = require('connect-flash')
require("./models/posts")
const posts = mongoose.model("postagens")
require("./models/Categoria")
const categoria = mongoose.model("categorias")
require("./models/user")
const usuarios = mongoose.model("usuarios")
const users = require("./routes/users")
app.use(express.static("public"))
app.use(express.static("views"))
const {eAdmin} = require("./helpers/eAdmin")
require("./models/mensagens")
const Message = mongoose.model("Message")
const http = require("http").createServer(app)
const io = require("socket.io")(http)
const pictureRouter = require("./routes/picture")
require("./models/imgs")
const pictures = mongoose.model("imagens")
const Handlebars = require('handlebars');
require("./models/groups")
const group = mongoose.model("groups")
require("./models/messagespost")
const coments  = mongoose.model("coments")

io.on('connection', socket => {
    console.log('Novo usuário conectado');
  
    socket.on('new-message', data => {
      const message = new Message(data);
      message.save().then(()=>{
        io.emit('new-message', data);
      }).catch((err)=>{
        console.log(err)
      })

      });
    socket.on('coment', dados => {
        const comens = new coments(dados);
        comens.save().then(()=>{
          io.emit('coment', dados);
        }).catch((err)=>{
          console.log(err)
        })
  
    });
    });
  


//configuração]
const store = new MongoStore({ 
    url: 'mongodb://localhost/blogapp', // a URL do banco de dados MongoDB
    autoRemove: 'interval',
    autoRemoveInterval: 10 
  });
    //sessão 
    app.use(session({
        secret: "something",
        resave: true,
        saveUninitialized: true,
        store: store
    }))

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())

    //middleware
    app.use((req, res, next)=>{
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error_")
        res.locals.user = req.user||null
        next()

    })
    //body parser
    app.use(bodyparser.urlencoded({extended: true}))
    app.use(bodyparser.json())
    //handlebars
    app.engine('handlebars', handlebars.engine({defaultLayout: 'main'}))
    app.set('view engine', 'handlebars')
    Handlebars.registerHelper('error_', function (message) {
        return new Handlebars.SafeString(`<div class="error">${message}</div>`);
      });
    Handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
        switch (operator) {
          case '==':
            return (v1 == v2) ? options.fn(this) : options.inverse(this);
          case '===':
            return (v1 === v2) ? options.fn(this) : options.inverse(this);
          case '!=':
            return (v1 != v2) ? options.fn(this) : options.inverse(this);
          case '!==':
            return (v1 !== v2) ? options.fn(this) : options.inverse(this);
          case '<':
            return (v1 < v2) ? options.fn(this) : options.inverse(this);
          case '<=':
            return (v1 <= v2) ? options.fn(this) : options.inverse(this);
          case '>':
            return (v1 > v2) ? options.fn(this) : options.inverse(this);
          case '>=':
            return (v1 >= v2) ? options.fn(this) : options.inverse(this);
          case '&&':
            return (v1 && v2) ? options.fn(this) : options.inverse(this);
          case '||':
            return (v1 || v2) ? options.fn(this) : options.inverse(this);
          default:
            return options.inverse(this);
        }
      });
    //mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect("mongodb://localhost/blogapp").then(()=>{
            console.log("Conecção bem sucedida")
        }).catch((err)=>{
            console.log("ERRO ENCONTRADO: "+err)
        })

    //Public
        app.use(express.static(path.join(__dirname, 'public')))

        // app.use((req, res, next)=>{
        //     console.log("Olá eu sou um middleware")
        //     next()
        // })
//rotas
app.get("/", (req, res)=>{
    res.render("index")
})
app.get('/home', (req, res)=> {
    posts.find().lean().populate("categoria").sort({data: "desc"}).then((postagens)=>{
        // console.log(postagens.tipo)
        res.render("home/index", {postagens: postagens, user: req.user.nome})
    }).catch((err)=>{
        console.log(err)
        req.flash('error_msg', "Houve um erro interno")
        res.redirect("/404")
    })
})
app.get("/msg/:id", (req, res)=>{
    posts.find({_id: req.params.id}).lean().then((postagens)=>{
        coments.find({chat: req.params.id}).lean().then((msg)=>{
            res.render("postagem/coments", {postagens: postagens, user: req.user.nome, msg: msg})
        })
    }).catch((err)=>{
        console.log(err)
    })
})
app.get("/404", (req, res)=>{
    res.send("Erro 404! Not found")
})
app.get('/posts', (req, res)=> {
        res.send('rota de posts')
})

app.get("/postagem/:slug", (req, res)=>{
    posts.findOne({Slug: req.params.slug}).lean().then((postagem)=>{
        if(postagem && req.isAuthenticated){
            Message.find().lean().sort({data: "desc"}).then((msg)=>{
                res.render("postagem/index", {msg: msg,postagem: postagem, usuario: req.user.nome})
            }).catch((err)=>{
                console.log(`Erro ao mostrar mensagem ${err}`)
            })
        }
        if(!postagem){
            req.flash("error_msg", "Essa postagem não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/")
})
})
app.get("/categorias", (req, res)=>{
    categoria.find().lean().then((categorias)=>{
        res.render("categorias/index", {categorias: categorias})
    }).catch((err)=>{
        req.flash("error", "erro ao listar categorias")
        res.redirect("/")
    })
})
app.get("/categorias/:Slug", (req, res)=>{
    categoria.findOne({Slug: req.query.Slug}).lean().then((categorias)=>{
        if(categorias){
            posts.find({categorias: categorias._id}).lean().then((postagens)=>{
                res.render("categorias/postagens", {postagens: postagens, categorias: categorias})
            }).catch((err)=>{
                req.flash("error_msg", "erro ao listar os posts")
            })
        }else{
            req.flash("error_msg", "Essa categoria não existe")
        }
    }).catch((err)=>{
        req.flash("error_msg", "Houve um erro ao carregar a página."+err)
        res.redirect("/")
    })
})

// app.post("/login", (req, res, next)=>{
//     passport.authenticate("local", {
//         successRedirect: "/",
//         failureRedirect: "/users/login",
//         failureFlash: true
//     })(req, res, next)
// })
app.get("/chat",eAdmin, (req, res)=>{
    group.find().lean().sort({data: "desc"}).then((grupos)=>{
        res.render("chat/index", {grupos: grupos, user: req.user.nome})
    }).catch((err)=>{
        console.log(err)
    })
    // Message.find().lean().sort({Date: "desc"}).then((msg)=>{
    //     if(req.isAuthenticated){
    //         res.render("chat/index", {msg: msg, usuario: req.user.nome})           
    //     }else{
    //         req.flash("error_msg", "Você não está cadastrado, faça login")
    //     }
    // }).catch((err)=>{
    //     console.log(err)
    // })
})
app.get("/chat/novo",eAdmin, (req, res)=>{
    res.render("chat/addgroup")
})
app.post("/chat/novo",(req, res)=>{
    var erros = []
    const title = req.body.nome
    const tema = req.body.tema

    if(typeof title == undefined ||!title || title == null){
        erros.push({texto: "Titulo inválido"})
    }
    if(typeof tema == undefined ||!tema || tema == null){
        erros.push({texto: "Tema inválido"})
    }
    if(erros.length > 0 ){
        res.render("chat/addgroup", {erros: erros})
    }

    const newgroup ={
        tema: req.body.tema,
        nome: req.body.nome
    }

    new group(newgroup).save().then(()=>{
        req.flash("success_msg", "Grupo cadastrado com sucesso")
        res.redirect("/chat")
    }).catch((err)=>{
        console.log("-------------------------------")
        console.log(err)
        console.log("-------------------------------")
        req.flash("error_msg", "Erro ao cadastrar grupo")
        res.redirect("/chat")
    })
})
app.get("/chat/:id", (req, res)=>{
    group.findOne({_id: req.params.id}).lean().then((group)=>{
        Message.find({chat: req.params.id}).lean().sort().then((msg)=>{
            res.render("chat/chatall", {group: group, msg: msg, usuario: req.user.nome})
            console.log(msg)
        }).catch((err)=>{
            console.log(err)
        })
    }).catch((err)=>{
        res.redirect(req.originalUrl)
        req.flash("error_msg", "Erro ao renderizar o chat")
    })
})

    app.use("/pictures", pictureRouter)
    app.use('/admin', admin)
    app.use("/users", users)
//outros
const PORT = 3000

http.listen(PORT, ()=>{
    console.log("Servidor rodando na porta: "+PORT)
})