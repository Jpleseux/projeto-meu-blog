const Imagens = require("../models/imgs")

const fs =require("fs")

exports.create = async (req, res)=>{
    try{
      const file = req.file

      const {filename} = file;

      const picture = new Imagens({
        nome: filename,
        src: file.path
      })
    await picture.save()
    res.redirect("/pictures")
  } catch(error){
      console.log(error)
        res.status(500).json({mensagem: "Erro ao salvar imagem"})

    }
}

exports.findAll = async(req, res)=>{
  try{

    const pictures = await Imagens.find()
    res.json(pictures)
    // res.sendFile(__dirname + '/../views/index.html', {pictures: pictures})
  }catch (error){
    console.log(error)
  }
}

exports.remove = async(req, res)=>{
  try{
    const picture = await Imagens.findById(req.params.id)
    if(!picture){
      return res.status(404).json({message: "Imagem não encontrada"})
    }
    fs.unlinkSync(picture.src)

    await picture.remove()

  }catch(error){
    res.status(404).json({message: 'Erro ao excluir mensagem'})
  }
}