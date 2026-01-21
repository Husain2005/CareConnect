import express from 'express';
const router = express.Router();

// Placeholder routes for appointment management
router.get('/', (req, res) => {
  res.json({ message: 'Appointment routes' });
});

router.post('/book', (req, res) => {
  res.json({ message: 'Book appointment' });
});

router.get('/:id', (req, res) => {
  res.json({ message: `Get appointment ${req.params.id}` });
});

export default router;
