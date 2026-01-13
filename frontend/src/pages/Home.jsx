import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const [gigs, setGigs] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGigs();
  }, [search]);

  const fetchGigs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/gigs', {
        params: { search }
      });
      setGigs(response.data);
    } catch (error) {
      console.error('Error fetching gigs:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Browse Available Gigs
        </h1>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Search gigs by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">Loading gigs...</div>
        </div>
      ) : gigs.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-lg text-gray-600">
            {search ? 'No gigs found matching your search.' : 'No open gigs available.'}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {gigs.map((gig) => (
            <Link
              key={gig._id}
              to={`/gig/${gig._id}`}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                {gig.title}
              </h2>
              <p className="text-gray-600 mb-4 line-clamp-3">
                {gig.description}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-blue-600">
                  ${gig.budget}
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                  {gig.status}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-4">
                Posted by: {gig.ownerId?.name || 'Unknown'}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
