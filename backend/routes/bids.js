import express from 'express';
import mongoose from 'mongoose';
import Bid from '../models/Bid.js';
import Gig from '../models/Gig.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, async (req, res) => {
  try {
    const { gigId, message, price } = req.body;

    if (!gigId || !message || price === undefined) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.status !== 'open') {
      return res.status(400).json({ message: 'Gig is no longer open for bidding' });
    }

    if (gig.ownerId.toString() === req.user.userId) {
      return res.status(400).json({ message: 'You cannot bid on your own gig' });
    }

    const existingBid = await Bid.findOne({
      gigId,
      freelancerId: req.user.userId
    });

    if (existingBid) {
      return res.status(400).json({ message: 'You have already bid on this gig' });
    }

    const bid = new Bid({
      gigId,
      freelancerId: req.user.userId,
      message,
      price
    });

    await bid.save();
    await bid.populate('freelancerId', 'name email');
    await bid.populate('gigId', 'title');

    res.status(201).json(bid);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:gigId', authenticate, async (req, res) => {
  try {
    const { gigId } = req.params;

    const gig = await Gig.findById(gigId);
    if (!gig) {
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Only the gig owner can view bids' });
    }

    const bids = await Bid.find({ gigId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:bidId/hire', authenticate, async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { bidId } = req.params;

    const bid = await Bid.findById(bidId).session(session);
    if (!bid) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Bid not found' });
    }

    const gig = await Gig.findById(bid.gigId).session(session);
    if (!gig) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Gig not found' });
    }

    if (gig.ownerId.toString() !== req.user.userId) {
      await session.abortTransaction();
      return res.status(403).json({ message: 'Only the gig owner can hire freelancers' });
    }

    if (gig.status !== 'open') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Gig is no longer open' });
    }

    if (bid.status !== 'pending') {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Bid is no longer pending' });
    }

    await Gig.findByIdAndUpdate(
      gig._id,
      { status: 'assigned' },
      { session }
    );

    await Bid.findByIdAndUpdate(
      bidId,
      { status: 'hired' },
      { session }
    );

    await Bid.updateMany(
      {
        gigId: gig._id,
        _id: { $ne: bidId },
        status: 'pending'
      },
      { status: 'rejected' },
      { session }
    );

    await session.commitTransaction();

    const updatedBid = await Bid.findById(bidId)
      .populate('freelancerId', 'name email')
      .populate('gigId', 'title');

    const io = req.app.get('io');
    if (io) {
      io.emit('bidHired', {
        bidId: bidId,
        freelancerId: bid.freelancerId.toString(),
        gigTitle: gig.title,
        message: `You have been hired for ${gig.title}!`
      });
    }

    res.json({
      message: 'Freelancer hired successfully',
      bid: updatedBid
    });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ message: error.message });
  } finally {
    session.endSession();
  }
});

router.get('/user/my-bids', authenticate, async (req, res) => {
  try {
    const bids = await Bid.find({ freelancerId: req.user.userId })
      .populate('gigId', 'title description budget status ownerId')
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json(bids);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;
