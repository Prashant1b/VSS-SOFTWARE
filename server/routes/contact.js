import express from 'express';
import { createContact, listContacts } from '../Controller/contactController.js';

const router = express.Router();

router.post('/', createContact);
router.get('/', listContacts);

export default router;
