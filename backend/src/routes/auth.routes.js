import express from 'express';
import { studentSignup, teacherSignup, login } from '../controllers/auth.controller.js';
import { authSTD } from '../middlewares/stdAuth.middleware.js';
import { upload } from '../middlewares/multer.middleware.js';
import { addStudentDetails, getStudent } from '../controllers/student.controller.js';

const router = express.Router();

// Auth routes
router.post('/student/signup', studentSignup);
router.post('/teacher/signup', teacherSignup);
router.post('/login', login);

// Student document verification routes
router.route('/student/verification/:id')
    .post(
        authSTD,
        upload.fields([
            { name: 'Aadhaar', maxCount: 1 },
            { name: 'Secondary', maxCount: 1 },
            { name: 'Higher', maxCount: 1 }
        ]),
        addStudentDetails
    );

router.route('/student/document/:id')
    .get(authSTD, getStudent);

export default router;