const prisma = require("../config/prisma");

exports.create = async (req, res) => {
  try {
    const { name } = req.body;
    const category = await prisma.category.create({
      data: {
        name: name,
      },
    });
    res.status(201).send(category);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
exports.list = async (req, res) => {
  try {
    const categorylist = await prisma.category.findMany();
    res.send(categorylist);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const productCount = await prisma.product.count({
      where: {
        categoryId: parseInt(id),
      },
    });

    if (productCount > 0) {
      return res.status(400).json({
        message: "Cannot delete: category in use",
      });
    }

    const deleteItem = await prisma.category.delete({
      where: {
        id: parseInt(id),
      },
    });

    res.send(deleteItem);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
