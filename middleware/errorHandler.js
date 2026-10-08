const notFoundApi = (req, res) => res.status(404).json({ error: 'Not found' });

// Must be registered after every route.
const errorHandler = (err, req, res, next) => {
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'That file is too large (photos 8 MB, videos 60 MB)' });
  console.error(err);
  res.status(500).json({ error: 'Something went wrong. Please try again.' });
};

module.exports = { notFoundApi, errorHandler };
