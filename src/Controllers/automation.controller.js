import { createAutomation, getUserAutomations } from '../Services/automation.service.js';

// POST /api/automations
export const createUserAutomation = async (req, res) => {
  try {
    const automation = await createAutomation(req.user.id, req.body);
    res.status(201).json({ message: 'Automation created ✅', data: automation });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// GET /api/automations
export const listUserAutomations = async (req, res) => {
  try {
    const automations = await getUserAutomations(req.user.id);
    res.status(200).json({ message: 'Automations fetched ✅', count: automations.length, data: automations });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
