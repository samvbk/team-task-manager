const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getUsers = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, createdAt: true },
      orderBy: { name: 'asc' },
    });
    res.json({ users });
  } catch (err) {
    next(err);
  }
};

module.exports = { getUsers };
