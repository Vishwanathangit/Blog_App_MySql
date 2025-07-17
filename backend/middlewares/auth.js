import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ message: 'Authorization header required' });
    }
    
    const token = authHeader.startsWith('Bearer ') ? authHeader.split(' ')[1] : null;

    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    if (!JWT_SECRET) {
      console.error('JWT_SECRET is not defined in environment variables');
      return res.status(500).json({ message: 'Server configuration error' });
    }

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
      if (err) {
        console.error('JWT verification failed:', err);
        
        if (err.name === 'TokenExpiredError') {
          return res.status(401).json({ message: 'Token has expired' });
        }
        
        if (err.name === 'JsonWebTokenError') {
          return res.status(403).json({ message: 'Invalid token' });
        }
        
        return res.status(403).json({ message: 'Token verification failed' });
      }

      // Set user info from decoded token
      req.user = {
        id: decoded.userId || decoded.id,
        username: decoded.username,
        email: decoded.email
      };

      console.log('Authenticated user:', req.user);
      next();
    });
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({ message: 'Authentication error' });
  }
};

export default authenticate;