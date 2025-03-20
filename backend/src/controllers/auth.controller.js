import { student } from '../models/student.model.js';
import { Teacher } from '../models/teacher.model.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

const generateAccessAndRefreshTokens = async (teacherID) => {
    try {
        const teacher = await Teacher.findById(teacherID);
        const accessToken = teacher.generateAccessToken();
        const refreshToken = teacher.generateRefreshToken();

        teacher.Refreshtoken = refreshToken;
        await teacher.save({ validateBeforeSave: false });

        return { accessToken, refreshToken };
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token");
    }
}

export const studentSignup = async (req, res, next) => {
    try {
        const { Firstname, Lastname, Email, Password } = req.body;

        if ([Firstname, Lastname, Email, Password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const existedStudent = await student.findOne({ Email });
        if (existedStudent) {
            throw new ApiError(400, "Student already exists");
        }

        const existingTeacher = await Teacher.findOne({ Email });
        if (existingTeacher) {
            throw new ApiError(400, "Email belongs to a Teacher");
        }

        const newStudent = await student.create({
            Email,
            Firstname,
            Lastname,
            Password,
            Studentdetails: null,
            Isverified: true
        });

        const createdStudent = await student.findById(newStudent._id).select("-Password");
        if (!createdStudent) {
            throw new ApiError(501, "Student registration failed");
        }

        return res.status(201).json(
            new ApiResponse(201, createdStudent, "Student signup successful")
        );
    } catch (error) {
        next(error);
    }
};

export const teacherSignup = async (req, res, next) => {
    try {
        const { Firstname, Lastname, Email, Password } = req.body;

        if ([Firstname, Lastname, Email, Password].some((field) => field?.trim() === "")) {
            throw new ApiError(400, "All fields are required");
        }

        const existingTeacher = await Teacher.findOne({ Email });
        if (existingTeacher) {
            throw new ApiError(400, "Teacher already exists");
        }

        const existingStudent = await student.findOne({ Email });
        if (existingStudent) {
            throw new ApiError(400, "Email belongs to a Student");
        }

        const newTeacher = await Teacher.create({
            Email,
            Firstname,
            Lastname,
            Password,
            Teacherdetails: null,
            Isverified: true
        });

        const createdTeacher = await Teacher.findById(newTeacher._id).select("-Password");
        if (!createdTeacher) {
            throw new ApiError(501, "Teacher registration failed");
        }

        return res.status(201).json(
            new ApiResponse(201, createdTeacher, "Teacher signup successful")
        );
    } catch (error) {
        next(error);
    }
};

export const login = async (req, res, next) => {
    try {
        const { Email, Password } = req.body;

        if (!Email || !Password) {
            throw new ApiError(400, "Email and Password are required");
        }

        const teacher = await Teacher.findOne({ Email });
        const std = await student.findOne({ Email });

        if (!teacher && !std) {
            throw new ApiError(404, "User not found");
        }

        if (teacher) {
            const isPasswordValid = await teacher.comparePassword(Password);
            if (!isPasswordValid) {
                throw new ApiError(401, "Invalid credentials");
            }

            const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(teacher._id);
            const loggedInTeacher = await Teacher.findById(teacher._id).select("-Password -Refreshtoken");

            const options = {
                httpOnly: true,
                secure: true
            };

            return res
                .status(200)
                .cookie("Accesstoken", accessToken, options)
                .cookie("Refreshtoken", refreshToken, options)
                .json(new ApiResponse(200, {
                    user: loggedInTeacher,
                    accessToken,
                    refreshToken,
                    role: "teacher"
                }, "Teacher logged in successfully"));
        }

        if (std) {
            const isPasswordValid = await std.isPasswordCorrect(Password);
            if (!isPasswordValid) {
                throw new ApiError(401, "Invalid credentials");
            }

            return res.status(200).json(new ApiResponse(200, {
                user: std,
                role: "student"
            }, "Student logged in successfully"));
        }
    } catch (error) {
        next(error);
    }
};