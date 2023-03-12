const CategoriasServices = require("../../database/services/categorias/CategoriasServices");

module.exports = {
  editCategory: (req, res) => {
    const categorys = CategoriasServices.getCategoris;
    res.render("admin/categorias", { categorias: categorys });
  },
};
