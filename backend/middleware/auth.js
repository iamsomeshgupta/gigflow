import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret';

export const authenticate = (req, res, next) => {
  try {
    // support token from cookie or Authorization header (Bearer)
    let token = null;
    if (req.cookies && req.cookies.token) token = req.cookies.token;
    const authHeader = req.headers.authorization || req.headers.Authorization;
    if (!token && authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid or expired token' });
  }
};
