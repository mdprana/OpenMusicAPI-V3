const Joi = require('joi');

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear())
    .required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().integer().positive(),
  albumId: Joi.string(),
});

// Schema untuk query parameter - semua optional
const SongQuerySchema = Joi.object({
  title: Joi.string().optional(),
  performer: Joi.string().optional(),
}).options({ allowUnknown: true });

module.exports = {
  SongPayloadSchema,
  SongQuerySchema,
};
