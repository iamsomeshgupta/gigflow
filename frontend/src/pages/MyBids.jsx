import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useSocket } from '../context/SocketContext';

const MyBids = () => {
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const { notifications } = useSocket();

  useEffect(() => {
    fetchBids();
  }, []);

  const fetchBids = async () => {
    try {
      const response = await axios.get('/api/bids/user/my-bids', {
        withCredentials: true
      });
      setBids(response.data);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Bids</h1>
      
      {notifications.length > 0 && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded">
          <p className="font-bold">🎉 Congratulations!</p>
          {notifications.map((notif) => (
            <p key={notif.id}>{notif.message}</p>
          ))}
        </div>
      )}

      {bids.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-lg text-gray-600">You haven't placed any bids yet.</p>
          <Link
            to="/"
            className="mt-4 inline-block text-blue-600 hover:text-blue-800"
          >
            Browse available gigs
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {bids.map((bid) => (
            <div
              key={bid._id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                bid.status === 'hired'
                  ? 'border-l-4 border-green-500'
                  : bid.status === 'rejected'
                  ? 'border-l-4 border-red-500'
                  : ''
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <Link
                    to={`/gig/${bid.gigId._id}`}
                    className="text-xl font-semibold text-blue-600 hover:text-blue-800"
                  >
                    {bid.gigId?.title || 'Gig'}
                  </Link>
                  <p className="text-gray-600 mt-2">{bid.message}</p>
                  <p className="text-sm text-gray-500 mt-2">
                    Budget: ${bid.gigId?.budget || 'N/A'}
                  </p>
                </div>
                <div className="text-right ml-4">
                  <p className="text-2xl font-bold text-blue-600">${bid.price}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-semibold mt-2 inline-block ${
                      bid.status === 'hired'
                        ? 'bg-green-100 text-green-800'
                        : bid.status === 'rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {bid.status}
                  </span>
                </div>
              </div>
              {bid.gigId?.status === 'assigned' && bid.status === 'hired' && (
                <div className="mt-4 p-3 bg-green-50 rounded">
                  <p className="text-green-800 font-semibold">
                    ✓ You have been hired for this project!
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;
