import multer from 'multer';
import path from 'path';

const recruitmentUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF and DOC files are allowed'));
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default recruitmentUpload;
