const express = require("express")
const router = express.Router()
const path = require("path")
const mongoose = require("mongoose")
require("../models/imgs")
const pictures = mongoose.model("imagens")

const picture = require("../controllers/pictureController")

const upload = require("../config/multer")

router.post("/",upload.single("file"), picture.create)

router.get("/images/json", picture.findAll)

router.delete("/:id", picture.remove)

router.get("/", (req, res)=>{
    res.render("pictures/index")
})
router.get("/imagens", (req, res)=>{
    pictures.find().lean().then((imgs)=>{
        res.render("pictures/imagens", {imgs:imgs})
    }).catch((err)=>{
        console.log(err)
    })
})

// router.get("/files/:id", (req, res)=>{
//     const id = req.params.id
//     pictures.findOne({_id: new Object(id)}, (err, doc)=>{
//         if(err){
//             console.log(err)
//         }
//         res.contentType(doc.contentType)
//         res.send(doc.content.buffer)
//     })
//     res.render("pictures/imagens", {_id: id})
// })
// router.get("/teste", (req, res)=>{
    
// })

module.exports = router;