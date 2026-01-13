import express from 'express';
import Gig from '../models/Gig.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    const query = { status: 'open' };

    if (search) {
      query.title = { $regex: search, $options: 'i' };
    }

    const gigs = await Gig.find(query)
      .populate('ownerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(gigs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, budget } = req.body;

    if (!title || !description || !budget) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const gig = new Gig({
      title,
      description,
      budget,
      ownerId: req.user.userId
    });

    await gig.save();
    await gig.populate('ownerId', 'name email');

    res.status(201).json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const gig = await Gig.findById(req.params.id)
      .populate('ownerId', 'name email');

    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    res.json(gig);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
