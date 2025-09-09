const Joi = require('joi');

const PostExportPayloadSchema = Joi.object({
  targetEmail: Joi.string().email().required(),
});

module.exports = { PostExportPayloadSchema };
