import multer from 'multer';
import path from 'path';

const resourceUpload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const allowed = ['.pdf', '.doc', '.docx', '.ppt', '.pptx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and PPT files are allowed'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 },
});

export default resourceUpload;
