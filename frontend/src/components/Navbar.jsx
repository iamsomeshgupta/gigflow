import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { notifications, clearNotifications } = useSocket();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              GigFlow
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  to="/post-gig"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600"
                >
                  Post a Gig
                </Link>
                <Link
                  to="/my-bids"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 relative"
                >
                  My Bids
                  {notifications.length > 0 && (
                    <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {notifications.length}
                    </span>
                  )}
                </Link>
                <span className="text-gray-700">Hello, {user.name}</span>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
      {notifications.length > 0 && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="font-bold">New Notification!</p>
              {notifications.map((notif) => (
                <p key={notif.id}>{notif.message}</p>
              ))}
            </div>
            <button
              onClick={clearNotifications}
              className="text-green-700 hover:text-green-900"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
