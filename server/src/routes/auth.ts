import { Router } from 'express';
import jwt from 'jsonwebtoken';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_demo_key';

router.post('/login', (req, res) => {
  const { username, password } = req.body;

  // Simple hardcoded admin check for demo purposes
  if (username === 'admin' && password === 'password') {
    const token = jwt.sign({ role: 'admin' }, JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }

  return res.status(401).json({ error: 'Invalid credentials' });
});

export default router;
