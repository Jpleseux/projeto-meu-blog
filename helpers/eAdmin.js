
module.exports = {
    eAdmin:function (req, res, next){
        if(req.isAuthenticated()){
            return next()
        }
        req.flash("error_msg", "You must be logged to enter here or to be a admin")
        res.redirect("/")
        
    }
}