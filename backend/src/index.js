import dotenv from "dotenv";
import db from './database/db.js';
import { app } from './app.js';
import authRoutes from './routes/auth.routes.js';
import teacherRoutes from './routes/teacher.routes.js';
import studentRoutes from './routes/student.routes.js';
import events from 'events';
import cors from 'cors';
import testRoutes from './routes/test.routes.js';
    
// Load environment variables
dotenv.config({
    path: 'C:/Users/laksh/OneDrive/Desktop/SGP/e-Learning-Platform-main/backend/src/.env'   
});

// Increase the max listeners limit
events.EventEmitter.defaultMaxListeners = 20;

// Enable CORS with specific configuration
app.use(cors({
    origin: ['http://localhost:5173', ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Access-Control-Allow-Origin'],
    exposedHeaders: ['Set-Cookie', 'Authorization'],
    preflightContinue: false
}));

// Mount routes
app.use('/api/v1', authRoutes);
app.use('/api/v1/teacher', teacherRoutes);
app.use('/api/v1/student', studentRoutes);
app.use('/api/test', testRoutes);

db()
    .then(() => {
        const port = process.env.PORT || 8080;
        app.listen(port, () => {
            console.log(`Server is running at http://localhost:${port}`);
        });
    })
    .catch((err) => {
        console.log("mongodb connection failed !!!", err);
    });