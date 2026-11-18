const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    const issue = error.issues?.[0] || error.errors?.[0];
    const message = issue ? issue.message : error.message;

    return res.status(400).json({
      status: "error",
      message: message,
    });
  }
};

module.exports = validate;
