const prisma = require("../config/prisma.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        message: "โปรดระบุอีเมลหรือรหัสผ่าน",
      });
    }

    const checkuser = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (checkuser) {
      return res.status(400).json({
        message: "มีอีเมลนี้ในระบบแล้ว",
      });
    }

    const hashPassword = await bcrypt.hash(password, 10);

    await prisma.user.create({
      data: {
        email: email,
        password: hashPassword,
      },
    });
    res.send("สมัครสมาชิกสำเร็จ");
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "กรุณากรอกอีเมลหรือรหัสผ่าน",
      });
    }
    const user = await prisma.user.findFirst({
      where: {
        email: email,
      },
    });

    if (!user || !user.enabled) {
      return res
        .status(400)
        .json({ message: "ไม่พบผู้ใช้งานหรือผู้ใช้งานถูกจำกัด " });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" });
    }

    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    jwt.sign(payload, process.env.SECRET, { expiresIn: "1d" }, (err, token) => {
      if (err) {
        return res.status(500).json({ message: "Server Error" });
      }
      res.json({ payload, token });
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};

exports.currentUser = async (req, res) => {
  try {
    const user = await prisma.user.findFirst({
      where: {
        email: req.user.email,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        address: true,
        pictureUrl: true,
        picturePublicId: true,
      },
    });
    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
};
