const Joi = require('joi');

const ImageHeadersSchema = Joi.object({
  'content-type': Joi.string().valid(
    'image/apng',
    'image/avif', 
    'image/gif',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/svg+xml',
    'image/webp',
    'image/bmp',
  ).required(),
}).unknown();

const validateImageHeaders = (headers) => {
  const validationResult = ImageHeadersSchema.validate(headers);
  if (validationResult.error) {
    throw new Error(validationResult.error.message);
  }
};

module.exports = { 
  ImageHeadersSchema,
  validateImageHeaders,
};
