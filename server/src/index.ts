import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './db';
import postsRouter from './routes/posts';
import authRouter from './routes/auth';
import adminRouter from './routes/admin';
import { requireAdmin } from './middleware/auth';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Mount Routes
app.use('/api/auth', authRouter);
app.use('/api/admin', requireAdmin, adminRouter);
app.use('/api/posts', postsRouter);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

