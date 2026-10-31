import ApiError from '../utils/ApiError.js';

// Validates req[source] against a Joi schema and replaces it with the cleaned value
export default (schema, source = 'body') => (req, _res, next) => {
  const { error, value } = schema.validate(req[source], {
    abortEarly: false,
    stripUnknown: true,
    convert: true,
  });
  if (error) {
    return next(
      ApiError.badRequest(
        'Validation failed',
        error.details.map((d) => ({ field: d.path.join('.'), message: d.message }))
      )
    );
  }
  if (source === 'query') {
    Object.keys(req.query).forEach((k) => delete req.query[k]);
    Object.assign(req.query, value);
  } else {
    req[source] = value;
  }
  next();
};
