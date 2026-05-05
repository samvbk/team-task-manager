const express = require('express');
const { body } = require('express-validator');
const { updateTask, deleteTask, getDashboardStats } = require('../controllers/task.controller');
const { authenticate, requireProjectMember, requireProjectAdmin } = require('../middleware/auth.middleware');

const router = express.Router();

router.use(authenticate);

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Update task — task routes use :projectId + :taskId for RBAC
router.put(
  '/:projectId/:taskId',
  requireProjectMember,
  [body('title').optional().trim().notEmpty().withMessage('Title cannot be empty')],
  updateTask
);

router.delete('/:projectId/:taskId', requireProjectAdmin, deleteTask);

module.exports = router;
