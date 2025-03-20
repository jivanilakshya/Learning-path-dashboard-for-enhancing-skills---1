import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({
    path: 'C:/Users/laksh/OneDrive/Desktop/SGP/e-Learning-Platform-main/backend/src/.env'
});

const db = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('MongoDB connected');
    } catch (error) {
        console.error('MongoDB connection error:', error);
        throw new Error('MongoDB connection error');
    }
};

export default db;