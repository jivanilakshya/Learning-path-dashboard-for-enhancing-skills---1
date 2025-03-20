import joi from "@hapi/joi"
import { asyncHandler } from "../utils/asyncHandler.js"
import { ApiError } from "../utils/ApiError.js"

const authSchema = asyncHandler(async(req, res, next) => {
    try {
        const schema = joi.object({
            Email: joi.string().email().lowercase().required().messages({
                'string.email': 'Please enter a valid email address',
                'any.required': 'Email is required',
                'string.empty': 'Email cannot be empty'
            }),
            Password: joi.string().min(6).max(16).required().messages({
                'string.min': 'Password must be at least 6 characters long',
                'string.max': 'Password cannot exceed 16 characters',
                'any.required': 'Password is required',
                'string.empty': 'Password cannot be empty'
            })
        });
        
        const { error, value } = await schema.validate(req.body);
        
        if (error) {
            throw new ApiError(400, error.details[0].message);
        }

        // Update req.body with validated data
        req.body = value;
        next();
    } catch (error) {
        next(error);
    }
});

export { authSchema };



