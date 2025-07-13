const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;

exports.create = async (req, res) => {
  try {
    const { title, description, price, quantity, categoryId, images } =
      req.body;

    const product = await prisma.product.create({
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((image) => ({
            asset_id: image.asset_id,
            public_id: image.public_id,
            url: image.url,
            secure_url: image.secure_url,
          })),
        },
      },
      include: {
        images: true,
      },
    });
    res.status(201).json({
      message: "Product created successfully",
      product: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.list = async (req, res) => {
  try {
    const { count } = req.params;
    const products = await prisma.product.findMany({
      take: parseInt(count),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.status(200).json({
      message: "Products fetched successfully",
      products: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Sever Error",
    });
  }
};

exports.read = async (req, res) => {
  try {
    const { id } = req.params;
    const products = await prisma.product.findFirst({
      where: {
        id: parseInt(id),
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.status(200).json({
      message: "Product fetched successfully",
      products: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Sever Error",
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, price, quantity, categoryId, images } =
      req.body;

    await prisma.image.deleteMany({
      where: {
        productId: parseInt(id),
      },
    });

    const product = await prisma.product.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title: title,
        description: description,
        price: parseFloat(price),
        quantity: parseInt(quantity),
        categoryId: parseInt(categoryId),
        images: {
          create: images.map((image) => ({
            asset_id: image.asset_id,
            public_id: image.public_id,
            url: image.url,
            secure_url: image.secure_url,
          })),
        },
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.status(200).json({
      message: "Product updated successfully",
      product: product,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.remove = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { images: true },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await Promise.all(
      product.images.map((img) =>
        img.public_id ? cloudinary.uploader.destroy(img.public_id) : null
      )
    );

    const deletedProduct = await prisma.product.delete({
      where: { id: product.id },
    });

    res.status(200).json({
      message: "Product deleted successfully",
      product: deletedProduct,
    });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.listby = async (req, res) => {
  try {
    const { sort, order, limit } = req.body;

    const products = await prisma.product.findMany({
      take: limit,
      orderBy: {
        [sort]: order,
      },
      include: {
        category: true,
        images: true,
      },
    });
    res.status(200).json({
      message: "Products fetched successfully",
      products: products,
    });
  } catch (error) {
    res.status(500).json({
      message: "Sever Error",
    });
  }
};

exports.searchFilters = async (req, res) => {
  try {
    const { search, categoryId, priceRange } = req.body;

    const filters = {};

    if (search) {
      filters.title = { contains: search, mode: "insensitive" };
    }

    if (categoryId && categoryId.length > 0) {
      filters.categoryId = { in: categoryId };
    }

    if (priceRange && priceRange.length === 2) {
      filters.price = {
        gte: priceRange[0],
        lte: priceRange[1],
      };
    }

    const products = await prisma.product.findMany({
      where: filters,
      include: {
        category: true,
        images: true,
      },
    });

    return res.status(200).json({
      message: "Products fetched successfully",
      products,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.createImages = async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.body.image, {
      public_id: `Kaitoon-${Date.now()}`,
      resource_type: "auto",
      folder: "Ecom2025",
    });
    res.send(result);
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
exports.removeImage = async (req, res) => {
  try {
    const { public_id } = req.body;
    cloudinary.uploader.destroy(public_id, (result) => {
      res.send("Remove Image Success");
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
    });
  }
};
