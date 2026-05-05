const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const authenticate = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, name: true, email: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

const requireGlobalAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return res.status(403).json({ error: 'Global admin access required' });
  }
  next();
};

const requireProjectMember = async (req, res, next) => {
  const projectId = req.params.id || req.params.projectId;

  try {
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
    });

    // Global admins bypass project membership check
    if (!membership && req.user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Not a member of this project' });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

const requireProjectAdmin = async (req, res, next) => {
  const projectId = req.params.id || req.params.projectId;

  try {
    const membership = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId: req.user.id,
        },
      },
    });

    // Global admins OR project admins
    if (req.user.role === 'ADMIN') {
      req.membership = membership;
      return next();
    }

    if (!membership || membership.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Project admin access required' });
    }

    req.membership = membership;
    next();
  } catch (err) {
    next(err);
  }
};

module.exports = { authenticate, requireGlobalAdmin, requireProjectMember, requireProjectAdmin };
