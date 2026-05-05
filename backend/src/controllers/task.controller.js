const { PrismaClient } = require('@prisma/client');
const { validationResult } = require('express-validator');

const prisma = new PrismaClient();

const getProjectTasks = async (req, res, next) => {
  const { status, priority, assigneeId } = req.query;

  try {
    const where = { projectId: req.params.id };
    if (status) where.status = status;
    if (priority) where.priority = priority;
    if (assigneeId) where.assigneeId = assigneeId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ tasks });
  } catch (err) {
    next(err);
  }
};

const createTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  try {
    // Validate assignee is a member of the project
    if (assigneeId) {
      const isMember = await prisma.projectMember.findUnique({
        where: { projectId_userId: { projectId: req.params.id, userId: assigneeId } },
      });
      if (!isMember && req.user.role !== 'ADMIN') {
        return res.status(400).json({ error: 'Assignee must be a project member' });
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || 'TODO',
        priority: priority || 'MEDIUM',
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId: req.params.id,
        assigneeId: assigneeId || null,
        createdById: req.user.id,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    res.status(201).json({ task });
  } catch (err) {
    next(err);
  }
};

const updateTask = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  try {
    const task = await prisma.task.findUnique({
      where: { id: req.params.taskId },
      include: { project: { include: { members: true } } },
    });

    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (status !== undefined) updateData.status = status;
    if (priority !== undefined) updateData.priority = priority;
    if (dueDate !== undefined) updateData.dueDate = dueDate ? new Date(dueDate) : null;
    if (assigneeId !== undefined) updateData.assigneeId = assigneeId || null;

    const updated = await prisma.task.update({
      where: { id: req.params.taskId },
      data: updateData,
      include: {
        assignee: { select: { id: true, name: true, email: true } },
        createdBy: { select: { id: true, name: true } },
      },
    });

    res.json({ task: updated });
  } catch (err) {
    next(err);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const task = await prisma.task.findUnique({ where: { id: req.params.taskId } });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }

    await prisma.task.delete({ where: { id: req.params.taskId } });
    res.json({ message: 'Task deleted successfully' });
  } catch (err) {
    next(err);
  }
};

const getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    // Get projects user is member of
    const memberOf = isAdmin
      ? await prisma.project.findMany({ select: { id: true } })
      : await prisma.projectMember.findMany({
          where: { userId },
          select: { projectId: true },
        });

    const projectIds = isAdmin
      ? memberOf.map((p) => p.id)
      : memberOf.map((m) => m.projectId);

    const now = new Date();

    const [totalTasks, todoCount, inProgressCount, doneCount, overdueCount, myTasks, recentTasks] =
      await Promise.all([
        prisma.task.count({ where: { projectId: { in: projectIds } } }),
        prisma.task.count({ where: { projectId: { in: projectIds }, status: 'TODO' } }),
        prisma.task.count({ where: { projectId: { in: projectIds }, status: 'IN_PROGRESS' } }),
        prisma.task.count({ where: { projectId: { in: projectIds }, status: 'DONE' } }),
        prisma.task.count({
          where: {
            projectId: { in: projectIds },
            dueDate: { lt: now },
            status: { not: 'DONE' },
          },
        }),
        prisma.task.findMany({
          where: { assigneeId: userId, status: { not: 'DONE' } },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
          },
          orderBy: { dueDate: 'asc' },
          take: 5,
        }),
        prisma.task.findMany({
          where: { projectId: { in: projectIds } },
          include: {
            project: { select: { id: true, name: true } },
            assignee: { select: { id: true, name: true } },
            createdBy: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 8,
        }),
      ]);

    res.json({
      stats: { totalTasks, todoCount, inProgressCount, doneCount, overdueCount, totalProjects: projectIds.length },
      myTasks,
      recentTasks,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getProjectTasks, createTask, updateTask, deleteTask, getDashboardStats };
