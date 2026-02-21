const { Router } = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticate } = require('../middleware/auth');
const { getDocuments, uploadDocument, getDocumentById, deleteDocument, getDeadlines } = require('../controllers/documentController');

const uploadDir = path.join(__dirname, '..', '..', 'uploads', 'documents');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 10) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, allowed.includes(ext));
  },
});

const router = Router();

router.get('/', authenticate, getDocuments);
router.post('/upload', authenticate, upload.single('file'), uploadDocument);
router.get('/deadlines', authenticate, getDeadlines);
router.get('/:id', authenticate, getDocumentById);
router.delete('/:id', authenticate, deleteDocument);

module.exports = router;
