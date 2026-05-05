const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const getProjects = async (req, res, next) => {
  try {
    let projects;

    if (req.user.role === 'ADMIN') {
      // Global admins see all projects
      projects = await prisma.project.findMany({
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    } else {
      projects = await prisma.project.findMany({
        where: {
          members: { some: { userId: req.user.id } },
        },
        include: {
          createdBy: { select: { id: true, name: true, email: true } },
          members: { include: { user: { select: { id: true, name: true, email: true } } } },
          _count: { select: { tasks: true } },
        },
        orderBy: { createdAt: 'desc' },
      });
    }

    res.json({ projects });
  } catch (err) {
    next(err);
  }
};

const createProject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;

  try {
    const project = await prisma.project.create({
      data: {
        name,
        description,
        createdById: req.user.id,
        members: {
          create: { userId: req.user.id, role: 'ADMIN' },
        },
      },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
        _count: { select: { tasks: true } },
      },
    });

    res.status(201).json({ project });
  } catch (err) {
    next(err);
  }
};

const getProject = async (req, res, next) => {
  try {
    const project = await prisma.project.findUnique({
      where: { id: req.params.id },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: {
          include: { user: { select: { id: true, name: true, email: true, role: true } } },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json({ project });
  } catch (err) {
    next(err);
  }
};

const updateProject = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { name, description } = req.body;

  try {
    const project = await prisma.project.update({
      where: { id: req.params.id },
      data: { name, description },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
        members: { include: { user: { select: { id: true, name: true, email: true } } } },
      },
    });

    res.json({ project });
  } catch (err) {
    next(err);
  }
};

const deleteProject = async (req, res, next) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.json({ message: 'Project deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const addMember = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { userId, role = 'MEMBER' } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const existing = await prisma.projectMember.findUnique({
      where: { projectId_userId: { projectId: req.params.id, userId } },
    });
    if (existing) {
      return res.status(400).json({ error: 'User is already a member' });
    }

    const member = await prisma.projectMember.create({
      data: { projectId: req.params.id, userId, role },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
};

const removeMember = async (req, res, next) => {
  const { memberId } = req.params;

  try {
    await prisma.projectMember.delete({
      where: { projectId_userId: { projectId: req.params.id, userId: memberId } },
    });

    res.json({ message: 'Member removed successfully' });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjects, createProject, getProject, updateProject, deleteProject, addMember, removeMember };
