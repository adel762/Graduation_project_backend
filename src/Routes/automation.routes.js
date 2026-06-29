import express from 'express';
import {
  createUserAutomation,
  listUserAutomations,
  getAutomation,
  updateUserAutomation,
  deleteUserAutomation,
} from '../Controllers/automation.controller.js';
import { authenticateJWT } from '../Middleware/auth.middleware.js';

const router = express.Router();

// All automation routes are protected
router.use(authenticateJWT);

router.post('/',       createUserAutomation);   // Create
router.get('/',        listUserAutomations);    // List all (paginated)
router.get('/:id',     getAutomation);          // Get single
router.patch('/:id',   updateUserAutomation);   // Update
router.delete('/:id',  deleteUserAutomation);   // Delete

export default router;
