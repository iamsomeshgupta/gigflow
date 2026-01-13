import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GigDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gig, setGig] = useState(null);
  const [bids, setBids] = useState([]);
  const [message, setMessage] = useState('');
  const [price, setPrice] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    fetchGig();
  }, [id]);

  useEffect(() => {
    if (gig && user) {
      setIsOwner(gig.ownerId._id === user.id);
      if (isOwner) {
        fetchBids();
      }
    }
  }, [gig, user, isOwner]);

  const fetchGig = async () => {
    try {
      const response = await axios.get(`/api/gigs/${id}`);
      setGig(response.data);
    } catch (error) {
      console.error('Error fetching gig:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchBids = async () => {
    try {
      const response = await axios.get(`/api/bids/${id}`, {
        withCredentials: true
      });
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
    }
  };

  const handleBidSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await axios.post(
        '/api/bids',
        {
          gigId: id,
          message,
          price: parseFloat(price)
        },
        { withCredentials: true }
      );
      setMessage('');
      setPrice('');
      alert('Bid submitted successfully!');
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit bid');
    } finally {
      setSubmitting(false);
    }
  };

  const handleHire = async (bidId) => {
    if (!window.confirm('Are you sure you want to hire this freelancer?')) {
      return;
    }

    try {
      await axios.patch(
        `/api/bids/${bidId}/hire`,
        {},
        { withCredentials: true }
      );
      alert('Freelancer hired successfully!');
      fetchBids();
      fetchGig();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to hire freelancer');
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!gig) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Gig not found</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{gig.title}</h1>
        <p className="text-gray-600 mb-4">{gig.description}</p>
        <div className="flex justify-between items-center">
          <span className="text-3xl font-bold text-blue-600">${gig.budget}</span>
          <span
            className={`px-4 py-2 rounded-full text-sm font-semibold ${
              gig.status === 'open'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-800'
            }`}
          >
            {gig.status}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Posted by: {gig.ownerId?.name || 'Unknown'}
        </p>
      </div>

      {isOwner && (
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Bids Received</h2>
          {bids.length === 0 ? (
            <p className="text-gray-600">No bids yet.</p>
          ) : (
            <div className="space-y-4">
              {bids.map((bid) => (
                <div
                  key={bid._id}
                  className={`border rounded-lg p-4 ${
                    bid.status === 'hired'
                      ? 'border-green-500 bg-green-50'
                      : bid.status === 'rejected'
                      ? 'border-red-500 bg-red-50'
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {bid.freelancerId?.name || 'Unknown'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {bid.freelancerId?.email || ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-blue-600">${bid.price}</p>
                      <span
                        className={`px-2 py-1 rounded text-xs ${
                          bid.status === 'hired'
                            ? 'bg-green-200 text-green-800'
                            : bid.status === 'rejected'
                            ? 'bg-red-200 text-red-800'
                            : 'bg-yellow-200 text-yellow-800'
                        }`}
                      >
                        {bid.status}
                      </span>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-3">{bid.message}</p>
                  {bid.status === 'pending' && gig.status === 'open' && (
                    <button
                      onClick={() => handleHire(bid._id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      Hire This Freelancer
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!isOwner && user && gig.status === 'open' && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Submit a Bid</h2>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          <form onSubmit={handleBidSubmit} className="space-y-4">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700">
                Your Price ($)
              </label>
              <input
                type="number"
                id="price"
                required
                min="0"
                step="0.01"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                Message
              </label>
              <textarea
                id="message"
                required
                rows="4"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                placeholder="Tell the client why you're the right person for this job..."
              />
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Bid'}
            </button>
          </form>
        </div>
      )}

      {!user && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-yellow-800">
            Please{' '}
            <a href="/login" className="text-blue-600 hover:underline">
              login
            </a>{' '}
            to submit a bid on this gig.
          </p>
        </div>
      )}
    </div>
  );
};

export default GigDetails;
