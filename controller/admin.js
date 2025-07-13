const prisma = require("../config/prisma");

exports.changeOrderStatus = async (req, res) => {
  try {
    const { orderId, orderStatus } = req.body;

    await prisma.order.update({
      where: {
        id: orderId,
      },
      data: {
        orderStatus: orderStatus,
      },
    });
    res.status(200).json({
      message: "Update Status Ok",
    });
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};

exports.getOrderAdmin = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
        orderedBy: {
          select: {
            id: true,
            email: true,
            address: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    res.send(orders);
  } catch (error) {
    res.status(500).json({
      message: "Server Error",
    });
  }
};
