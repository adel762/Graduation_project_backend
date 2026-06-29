import {
  createAutomation,
  getUserAutomations,
  getAutomationById,
  updateAutomation,
  deleteAutomation,
} from '../Services/automation.service.js';

// POST /api/automations
export const createUserAutomation = async (req, res) => {
  try {
    const automation = await createAutomation(req.user.id, req.body);
    res.status(201).json({
      success: true,
      data: automation,
      message: 'Smart automation created successfully.',
    });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

// GET /api/automations?limit=20&offset=0
export const listUserAutomations = async (req, res) => {
  try {
    const { limit, offset } = req.query;
    const result = await getUserAutomations(req.user.id, { limit, offset });
    res.status(200).json({
      success: true,
      data: result,
      message: 'Automations fetched successfully.',
    });
  } catch (err) {
    res.status(500).json({ success: false, data: null, message: err.message });
  }
};

// GET /api/automations/:id
export const getAutomation = async (req, res) => {
  try {
    const automation = await getAutomationById(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      data: automation,
      message: 'Automation fetched successfully.',
    });
  } catch (err) {
    res.status(404).json({ success: false, data: null, message: err.message });
  }
};

// PATCH /api/automations/:id
export const updateUserAutomation = async (req, res) => {
  try {
    const automation = await updateAutomation(req.user.id, req.params.id, req.body);
    res.status(200).json({
      success: true,
      data: automation,
      message: 'Automation updated successfully.',
    });
  } catch (err) {
    res.status(400).json({ success: false, data: null, message: err.message });
  }
};

// DELETE /api/automations/:id
export const deleteUserAutomation = async (req, res) => {
  try {
    const result = await deleteAutomation(req.user.id, req.params.id);
    res.status(200).json({
      success: true,
      data: result,
      message: 'Automation deleted successfully.',
    });
  } catch (err) {
    res.status(404).json({ success: false, data: null, message: err.message });
  }
};
