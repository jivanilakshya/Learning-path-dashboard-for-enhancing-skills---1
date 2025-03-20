import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { student, studentdocs } from "../models/student.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { Teacher } from "../models/teacher.model.js";
import { Sendmail } from "../utils/Nodemailer.js";
import jwt from 'jsonwebtoken';
//import { sendVerificationEmail } from '../utils/email.js';

const generateAccessAndRefreshTokens = async (stdID) => {
    try {
        const std = await student.findById(stdID)
        const Accesstoken = std.generateAccessToken()
        const Refreshtoken = std.generateRefreshToken()

        std.Refreshtoken = Refreshtoken
        await std.save({ validateBeforeSave: false })

        return { Accesstoken, Refreshtoken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating referesh and access token")
    }
}

const signup = asyncHandler(async (req, res) => {
    const { Firstname, Lastname, Email, Password } = req.body;

    if ([Firstname, Lastname, Email, Password].some((field) => field?.trim() === "")) {
        throw new ApiError(400, "All fields are required");
    }

    const existedStudent = await student.findOne({ Email });
    if (existedStudent) {
        throw new ApiError(400, "Student already exists");
    }

    const cheakTeach = await Teacher.findOne({ Email });
    if (cheakTeach) {
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

    // Generate tokens after successful signup
    const { Accesstoken, Refreshtoken } = await generateAccessAndRefreshTokens(newStudent._id);

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(201)
        .cookie("Accesstoken", Accesstoken, options)
        .cookie("Refreshtoken", Refreshtoken, options)
        .json(
            new ApiResponse(201, {
                user: createdStudent,
                Accesstoken,
                Refreshtoken
            }, "Signup successful")
        );
});

const login = asyncHandler(async (req, res) => {
    const { Email, Password } = req.body;

    if (!Email || !Password) {
        throw new ApiError(400, "Email and Password are required");
    }

    const existingStudent = await student.findOne({ Email });

    if (!existingStudent) {
        throw new ApiError(404, "Student does not exist");
    }

    const isPasswordValid = await existingStudent.isPasswordCorrect(Password);

    if (!isPasswordValid) {
        throw new ApiError(401, "Invalid credentials");
    }

    const { Accesstoken, Refreshtoken } = await generateAccessAndRefreshTokens(existingStudent._id);

    const loggedInStudent = await student.findById(existingStudent._id).select("-Password -Refreshtoken");

    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .cookie("Accesstoken", Accesstoken, options)
        .cookie("Refreshtoken", Refreshtoken, options)
        .json(
            new ApiResponse(
                200,
                {
                    user: loggedInStudent,
                    Accesstoken,
                    Refreshtoken
                },
                "Logged in successfully"
            )
        );
});

const logout = asyncHandler(async (req, res) => {
    await student.findByIdAndUpdate(
        req.Student._id,
        {
            $set: {
                Refreshtoken: undefined,
            }
        },
        {
            new: true
        }
    )
    const options = {
        httpOnly: true,
        secure: true,
    }

    return res
        .status(200)
        .clearCookie("Accesstoken", options)
        .clearCookie("Refreshtoken", options)
        .json(new ApiResponse(200, {}, "User logged out"))
})

const getStudent = asyncHandler(async (req, res) => {
    const user = req.Student
    const id = req.params.id
    if (req.Student._id != id) {
        throw new ApiError(400, "unauthroized access")
    }
    return res
        .status(200)
        .json(new ApiResponse(200, user, "Student is logged in"))
})

const addStudentDetails = async (req, res) => {
    try {
        const studentId = req.params.id;
        const { Phone, Address, Highesteducation, SecondarySchool, HigherSchool, SecondaryMarks, HigherMarks } = req.body;

        // Upload files to Cloudinary and log URLs
        let aadhaarUrl, secondaryUrl, higherUrl;

        if (req.files?.Aadhaar) {
            const aadhaarResponse = await uploadOnCloudinary(req.files.Aadhaar[0].path);
            if (aadhaarResponse) {
                aadhaarUrl = aadhaarResponse.secure_url;
                console.log("Aadhaar PDF uploaded to Cloudinary:", aadhaarUrl);
            }
        }

        if (req.files?.Secondary) {
            const secondaryResponse = await uploadOnCloudinary(req.files.Secondary[0].path);
            if (secondaryResponse) {
                secondaryUrl = secondaryResponse.secure_url;
                console.log("Secondary PDF uploaded to Cloudinary:", secondaryUrl);
            }
        }

        if (req.files?.Higher) {
            const higherResponse = await uploadOnCloudinary(req.files.Higher[0].path);
            if (higherResponse) {
                higherUrl = higherResponse.secure_url;
                console.log("Higher Secondary PDF uploaded to Cloudinary:", higherUrl);
            }
        }

        // Update student document details in MongoDB
        const updatedStudent = await student.findByIdAndUpdate(
            studentId,
            {
                Phone,
                Address,
                Highesteducation,
                SecondarySchool,
                HigherSchool,
                SecondaryMarks,
                HigherMarks,
                documentStatus: "pending",
                "documents.Aadhaar": aadhaarUrl,
                "documents.Secondary": secondaryUrl,
                "documents.Higher": higherUrl
            },
            { new: true }
        );

        console.log("Document URLs stored in MongoDB:", {
            Aadhaar: aadhaarUrl,
            Secondary: secondaryUrl,
            Higher: higherUrl
        });

        return res.status(200).json({
            success: true,
            message: "Documents uploaded successfully",
            data: updatedStudent
        });

    } catch (error) {
        console.error("Error in document upload:", error);
        return res.status(500).json({
            success: false,
            message: "Error uploading documents",
            error: error.message
        });
    }
};

const forgetPassword = asyncHandler(async (req, res) => {
    const { Email } = req.body

    if (!Email) {
        throw new ApiError(400, "Email is required")
    }

    const User = await student.findOne({ Email });

    if (!User) {
        throw new ApiError(404, "email not found!!");
    }

    await User.generateResetToken();
    await User.save();

    const resetToken = `${process.env.FRONTEND_URL}/student/forgetpassword/${User.forgetPasswordToken}`
    const subject = 'RESET PASSWORD'
    const message = ` <p>Dear ${User.Firstname}${User.Lastname},</p>
    <p>We have received a request to reset your password. To proceed, please click on the following link: <a href="${resetToken}" target="_blank">reset your password</a>.</p>
    <p>If the link does not work for any reason, you can copy and paste the following URL into your browser's address bar:</p>
    <p>${resetToken}</p>
    <p>Thank you for being a valued member of the Shiksharthee community. If you have any questions or need further assistance, please do not hesitate to contact our support team.</p>
    <p>Best regards,</p>
    <p>The Shiksharthee Team</p>`

    try {
        await Sendmail(Email, subject, message);
        res.status(200).json({
            success: true,
            message: `Reset password Email has been sent to ${Email} the email SuccessFully`
        })
    } catch (error) {
        throw new ApiError(404, "operation failed!!");
    }
})

const resetPassword = asyncHandler(async (req, res) => {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (password != confirmPassword) {
        throw new ApiError(400, "password does not match")
    }

    try {
        const user = await student.findOne({
            forgetPasswordToken: token,
            forgetPasswordExpiry: { $gt: Date.now() }
        });

        if (!user) {
            throw new ApiError(400, 'Token is invalid or expired. Please try again.');
        }

        user.Password = password;
        user.forgetPasswordExpiry = undefined;
        user.forgetPasswordToken = undefined;

        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password changed successfully!'
        });
    } catch (error) {
        console.error('Error resetting password:', error);
        throw new ApiError(500, 'Internal server error!!!');
    }
});

export {
    signup,
    login,
    logout,
    addStudentDetails,
    getStudent,
    forgetPassword,
    resetPassword
}
