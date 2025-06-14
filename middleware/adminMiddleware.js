const jwt = require('jsonwebtoken');
const { User } = require('../model/User.model');

const adminMiddleware = async (req, res, next) => {
    try {
        // Get token from cookies
        const token = req.cookies?.token;
        if (!token) {
            return res.status(403).json({ message: 'Access denied. No token provided.' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by the decoded token's email
        const user = await User.findOne({ email: decoded.email });

        if (user && user.role === 'Admin') {
            // Token and user role verified, proceed to the next middleware
            next();
        } else {
            return res.status(403).json({ message: 'Access denied. Only admins can access this route.' });
        }

    } catch (err) {
        console.error('Error in adminMiddleware:', err);
        return res.status(401).json({ message: 'Invalid token' });
    }
};

module.exports = adminMiddleware;
