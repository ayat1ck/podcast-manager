const Joi = require('joi');

// Validation schemas
const schemas = {
    // User registration schema
    register: Joi.object({
        username: Joi.string()
            .min(3)
            .max(30)
            .required()
            .messages({
                'string.min': 'Username must be at least 3 characters',
                'string.max': 'Username cannot exceed 30 characters',
                'any.required': 'Username is required'
            }),
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .min(6)
            .required()
            .messages({
                'string.min': 'Password must be at least 6 characters',
                'any.required': 'Password is required'
            })
    }),

    // User login schema
    login: Joi.object({
        email: Joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Please provide a valid email',
                'any.required': 'Email is required'
            }),
        password: Joi.string()
            .required()
            .messages({
                'any.required': 'Password is required'
            })
    }),

    // Update profile schema
    updateProfile: Joi.object({
        username: Joi.string()
            .min(3)
            .max(30)
            .messages({
                'string.min': 'Username must be at least 3 characters',
                'string.max': 'Username cannot exceed 30 characters'
            }),
        email: Joi.string()
            .email()
            .messages({
                'string.email': 'Please provide a valid email'
            })
    }),

    // Create podcast schema
    createPodcast: Joi.object({
        title: Joi.string()
            .required()
            .messages({
                'any.required': 'Title is required'
            }),
        author: Joi.string()
            .required()
            .messages({
                'any.required': 'Author is required'
            }),
        description: Joi.string()
            .allow('')
            .optional(),
        imageUrl: Joi.string()
            .uri()
            .allow('')
            .optional()
            .messages({
                'string.uri': 'Please provide a valid URL for image'
            }),
        rating: Joi.number()
            .min(1)
            .max(5)
            .optional()
            .messages({
                'number.min': 'Rating must be at least 1',
                'number.max': 'Rating cannot be more than 5'
            }),
        status: Joi.string()
            .valid('listening', 'completed', 'wishlist')
            .optional()
            .messages({
                'any.only': 'Status must be listening, completed, or wishlist'
            })
    }),

    // Update podcast schema
    updatePodcast: Joi.object({
        title: Joi.string()
            .optional(),
        author: Joi.string()
            .optional(),
        description: Joi.string()
            .allow('')
            .optional(),
        imageUrl: Joi.string()
            .uri()
            .allow('')
            .optional()
            .messages({
                'string.uri': 'Please provide a valid URL for image'
            }),
        rating: Joi.number()
            .min(1)
            .max(5)
            .optional()
            .allow(null)
            .messages({
                'number.min': 'Rating must be at least 1',
                'number.max': 'Rating cannot be more than 5'
            }),
        status: Joi.string()
            .valid('listening', 'completed', 'wishlist')
            .optional()
            .messages({
                'any.only': 'Status must be listening, completed, or wishlist'
            })
    })
};

// Validation middleware factory
const validate = (schemaName) => {
    return (req, res, next) => {
        const schema = schemas[schemaName];

        if (!schema) {
            return next(new Error(`Validation schema '${schemaName}' not found`));
        }

        const { error, value } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            res.status(400);
            const errorMessages = error.details.map(detail => detail.message).join(', ');
            return next(new Error(errorMessages));
        }

        // Replace body with validated value
        req.body = value;
        next();
    };
};

module.exports = { validate, schemas };
