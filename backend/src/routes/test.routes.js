import express from 'express';
import { upload } from '../middlewares/multer.middleware.js';
import { uploadOnCloudinary } from '../utils/cloudinary.js';

const router = express.Router();

router.post('/test-upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const result = await uploadOnCloudinary(req.file.path);
        
        if (!result) {
            return res.status(500).json({ message: 'Error uploading to Cloudinary' });
        }

        return res.status(200).json({
            message: 'File uploaded successfully',
            url: result.url
        });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
});

export default router; 