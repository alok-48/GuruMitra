function errorHandler(err, req, res, _next) {
  console.error(`[ERROR] ${err.message}`, err.stack);

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid request format' });
  }

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(413).json({ error: 'फाइल बहुत बड़ी है (File too large)' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'कुछ गलत हो गया, कृपया दोबारा कोशिश करें (Something went wrong)',
  });
}

module.exports = errorHandler;
