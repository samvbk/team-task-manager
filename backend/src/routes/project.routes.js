const express = require('express');
const { body } = require('express-validator');
const {
  getProjects,
  createProject,
  getProject,
  updateProject,
  deleteProject,
  addMember,
  removeMember,
} = require('../controllers/project.controller');
const { getProjectTasks, createTask } = require('../controllers/task.controller');
const {
  authenticate,
  requireProjectMember,
  requireProjectAdmin,
} = require('../middleware/auth.middleware');

const router = express.Router();

// All routes require authentication
router.use(authenticate);

router.get('/', getProjects);

router.post(
  '/',
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  createProject
);

router.get('/:id', requireProjectMember, getProject);

router.put(
  '/:id',
  requireProjectAdmin,
  [body('name').trim().notEmpty().withMessage('Project name is required')],
  updateProject
);

router.delete('/:id', requireProjectAdmin, deleteProject);

// Member management
router.post(
  '/:id/members',
  requireProjectAdmin,
  [body('userId').notEmpty().withMessage('User ID is required')],
  addMember
);

router.delete('/:id/members/:memberId', requireProjectAdmin, removeMember);

// Tasks within project
router.get('/:id/tasks', requireProjectMember, getProjectTasks);

router.post(
  '/:id/tasks',
  requireProjectMember,
  [body('title').trim().notEmpty().withMessage('Task title is required')],
  createTask
);

module.exports = router;
