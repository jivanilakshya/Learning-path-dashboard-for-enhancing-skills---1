import { Router } from "express";
import {
    signup,
    login,
    logout,
    addStudentDetails,
    getStudent,
    forgetPassword,
    resetPassword
} from "../controllers/student.controller.js";
import { upload } from "../middlewares/multer.middleware.js";
import { authSTD } from "../middlewares/stdAuth.middleware.js";
import { authSchema } from "../middlewares/joiLogin.middleware.js";

const router = Router();

router.route("/signup").post(signup);
router.route("/login").post(authSchema, login);
router.route("/logout").post(authSTD, logout);
router.route("/adddetails").post(authSTD, upload.fields([
    { name: "Secondary", maxCount: 1 },
    { name: "Higher", maxCount: 1 },
    { name: "Aadhaar", maxCount: 1 }
]), addStudentDetails);
router.route("/getstudent").get(authSTD, getStudent);
router.route("/forgetpassword").post(forgetPassword);
router.route("/resetpassword/:token").post(resetPassword);

export default router;