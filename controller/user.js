const prisma = require("../config/prisma");
const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const imageBase64 = req.body.image;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (user.picturePublicId) {
      await cloudinary.uploader.destroy(user.picturePublicId);
    }

    const uploadResult = await cloudinary.uploader.upload(imageBase64, {
      folder: "Profile_picture",
      public_id: `Profile_${Date.now()}`,
      resource_type: "auto",
    });

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        pictureUrl: uploadResult.secure_url,
        picturePublicId: uploadResult.public_id,
      },
    });

    res.status(200).json({
      message: "Profile picture updated successfully",
      user: {
        id: updatedUser.id,
        pictureUrl: updatedUser.pictureUrl,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.listUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        role: true,
        enabled: true,
        address: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.status(200).json({
      message: "Users fetched successfully",
      users: users,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.changeStatus = async (req, res) => {
  try {
    const { id, enabled } = req.body;

    if (id === req.user.id) {
      return res.status(500).json({ message: "ไม่สามารถจัดการบัญชีตัวเองได้" });
    }

    const user = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        enabled: enabled,
      },
    });
    res.status(200).json({
      message: "User status changed successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.changeRole = async (req, res) => {
  try {
    const { id, role } = req.body;

    if (id === req.user.id) {
      return res.status(500).json({ message: "ไม่สามารถจัดการบัญชีตัวเองได้" });
    }

    const user = await prisma.user.update({
      where: {
        id: parseInt(id),
      },
      data: {
        role: role,
      },
    });
    res.status(200).json({
      message: "User role changed successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.userCart = async (req, res) => {
  try {
    const { cart } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        id: parseInt(req.user.id),
      },
    });

    const error = [];

    for (const item of cart) {
      const product = await prisma.product.findUnique({
        where: { id: item.id },
        select: { quantity: true, title: true },
      });
      if (!product || item.count > product.quantity) {
        error.push(`ขออภัยสินค้า ${product.title} หมด`);
      }
    }

    if (error.length) {
      return res.status(400).json({ message: error });
    }

    await prisma.productOnCart.deleteMany({
      where: {
        cart: {
          orderedById: user.id,
        },
      },
    });

    await prisma.cart.deleteMany({
      where: {
        orderedById: user.id,
      },
    });

    let products = cart.map((item) => ({
      productId: item.id,
      count: item.count,
      price: item.price,
    }));

    let cartTotal = products.reduce(
      (total, item) => total + item.price * item.count,
      0
    );

    const newCart = await prisma.cart.create({
      data: {
        products: {
          create: products,
        },
        cartTotal: cartTotal,
        orderedById: user.id,
      },
    });
    res.status(200).json({
      message: "User cart updated successfully",
      newCart,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.getUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: parseInt(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        orderedBy: {
          select: { address: true, name: true },
        },
      },
    });
    res.status(200).json({
      products: cart.products,
      cartTotal: cart.cartTotal,
      user: cart.orderedBy,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.emptyUserCart = async (req, res) => {
  try {
    const cart = await prisma.cart.findFirst({
      where: {
        orderedById: parseInt(req.user.id),
      },
    });
    if (!cart) {
      return res.status(400).json({
        message: "No Cart",
      });
    }

    await prisma.productOnCart.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    const result = await prisma.cart.deleteMany({
      where: {
        orderedById: parseInt(req.user.id),
      },
    });

    res.status(200).json({
      message: "User cart emptied successfully",
      deletecount: result.count,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.addUserAddress = async (req, res) => {
  try {
    const { name, address } = req.body;

    const addressUser = await prisma.user.update({
      where: {
        id: parseInt(req.user.id),
      },
      data: {
        name: name,
        address: address,
      },
    });
    res.status(200).json({
      message: "User name & address added successfully",
      AddressUpdated: addressUser.address,
      Name: addressUser.name,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.saveOrder = async (req, res) => {
  try {
    const { id, amount, currency, status } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: parseInt(req.user.id) },
    });

    const userCart = await prisma.cart.findFirst({
      where: {
        orderedById: parseInt(req.user.id),
      },
      include: { products: true },
    });

    //Check Empty?
    if (!userCart || userCart.products.length === 0) {
      return res.status(400).json({
        message: "Cart is empty",
      });
    }

    const amountTH = amount / 100;

    // Create a New Order
    const order = await prisma.order.create({
      data: {
        products: {
          create: userCart.products.map((item) => ({
            productId: item.productId,
            count: item.count,
            price: item.price,
          })),
        },
        orderedBy: {
          connect: { id: req.user.id },
        },
        cartTotal: userCart.cartTotal,
        stripePaymentId: id,
        amount: parseInt(amountTH),
        paymentStatus: status,
        currency: currency,
        address: user.address,
      },
    });

    const update = userCart.products.map((item) => ({
      where: {
        id: item.productId,
      },
      data: {
        quantity: { decrement: item.count },
        sold: { increment: item.count },
      },
    }));

    await Promise.all(update.map((updated) => prisma.product.update(updated)));

    await prisma.cart.deleteMany({
      where: {
        orderedById: parseInt(req.user.id),
      },
    });

    res.status(200).json({
      message: "Order saved successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.getUserOrders = async (req, res) => {
  try {
    const orderlist = await prisma.order.findMany({
      where: {
        orderedById: parseInt(req.user.id),
      },
      include: {
        products: {
          include: {
            product: true,
          },
        },
        review: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    if (orderlist.length === 0) {
      return res.status(400).json({
        message: "No Order",
      });
    }

    res.send(orderlist);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.createOrderReview = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderId, rating, comment } = req.body;

    // 1. เช็คว่า order นี้เป็นของ user จริงไหม
    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.orderedById !== userId) {
      return res.status(403).json({ message: "คุณไม่มีสิทธิ์รีวิว order นี้" });
    }

    if (order.orderStatus !== "เสร็จสิ้น") {
      return res
        .status(400)
        .json({ message: "ยังไม่สามารถรีวิว order นี้ได้" });
    }

    const existingReview = await prisma.orderReview.findUnique({
      where: { orderId },
    });

    if (existingReview) {
      return res.status(400).json({ message: "รีวิวสำหรับ order นี้มีแล้ว" });
    }

    const review = await prisma.orderReview.create({
      data: {
        rating,
        comment,
        orderId,
        userId,
      },
    });

    res.status(201).json({
      message: "รีวิวสำเร็จ",
      review,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในระบบ",
    });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await prisma.orderReview.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: { email: true },
        },
        order: {
          include: {
            products: {
              include: {
                product: {
                  include: { images: true },
                },
              },
            },
          },
        },
      },
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error(error);
    res.status(500).json({
      message: "เกิดข้อผิดพลาดในระบบ",
    });
  }
};
