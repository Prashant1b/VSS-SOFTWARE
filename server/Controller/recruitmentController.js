import Recruitment from '../models/Recruitment.js';
import axios from 'axios';
import path from 'path';

const toSafePublicId = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\.[^.]+$/, '')
  .replace(/[^a-z0-9-_]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'recruitment-file';

const cleanEnv = (value) => String(value || '').trim().replace(/^"|"$/g, '');
const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '').slice(0, 10);
const escapeHtml = (value) => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&#039;');

function getSupabaseStorageConfig() {
  const url = cleanEnv(process.env.SUPABASE_URL);
  const serviceRoleKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = cleanEnv(process.env.SUPABASE_RECRUITMENT_BUCKET) || 'recruitment-files';

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase Storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to server environment.');
  }

  return {
    url: url.replace(/\/$/, ''),
    serviceRoleKey,
    bucket,
  };
}

async function uploadRecruitmentFile(file) {
  if (!file) return {};

  const { url, serviceRoleKey, bucket } = getSupabaseStorageConfig();
  const ext = path.extname(file.originalname).toLowerCase();
  const fileName = `${toSafePublicId(file.originalname)}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const storagePath = `recruitments/${new Date().getFullYear()}/${fileName}`;

  await axios.post(
    `${url}/storage/v1/object/${bucket}/${storagePath}`,
    file.buffer,
    {
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        'Content-Type': file.mimetype || 'application/octet-stream',
        'x-upsert': 'false',
      },
      maxBodyLength: Infinity,
    }
  );

  return {
    jdFile: fileName,
    jdFileUrl: '',
    jdFilePublicId: storagePath,
    jdFileOriginalName: file.originalname,
    jdFileStorageProvider: 'supabase',
    jdFileStoragePath: storagePath,
  };
}

function normalizeRecruitmentPayload(payload, fallback = {}) {
  const phone = normalizePhone(payload.phone || fallback.phone);
  const data = {
    companyName: String(payload.companyName || fallback.companyName || '').trim(),
    role: String(payload.role || fallback.role || '').trim(),
    headcount: String(payload.headcount || fallback.headcount || '').trim(),
    location: String(payload.location || fallback.location || '').trim(),
    email: String(payload.email || fallback.email || '').trim().toLowerCase(),
    phone,
  };

  if (!data.companyName || !data.role || !data.headcount || !data.location || !data.email) {
    throw new Error('Please fill all required recruitment fields');
  }

  if (!phone) {
    throw new Error('Mobile number is required');
  }

  if (!/^\d{10}$/.test(phone)) {
    throw new Error('Mobile number must be exactly 10 digits');
  }

  return data;
}

async function sendRecruitmentConfirmationEmail(recruitment) {
  const BREVO_API_KEY = cleanEnv(process.env.BREVO_API_KEY);
  const FROM_EMAIL = cleanEnv(process.env.FROM_EMAIL);

  if (!BREVO_API_KEY || !FROM_EMAIL || !recruitment.email) {
    console.warn('Recruitment confirmation email skipped: missing BREVO_API_KEY, FROM_EMAIL, or recipient');
    return;
  }

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: {
        email: FROM_EMAIL,
        name: 'VSS SOFTWARE',
      },
      to: [{ email: recruitment.email }],
      subject: 'Your hiring requirement has been received',
      htmlContent: `
        <div style="font-family:Arial,sans-serif;padding:20px;max-width:560px;margin:auto;color:#111;">
          <h2 style="margin-bottom:10px;">Hiring requirement received</h2>
          <p>Hi,</p>
          <p>Thank you for sharing your hiring requirement with VSS SOFTWARE. Our team has received your request and will review it shortly.</p>
          <p><b>Company:</b> ${escapeHtml(recruitment.companyName)}</p>
          <p><b>Role:</b> ${escapeHtml(recruitment.role)}</p>
          <p><b>Headcount:</b> ${escapeHtml(recruitment.headcount)}</p>
          <p><b>Location:</b> ${escapeHtml(recruitment.location)}</p>
          <p><b>Mobile:</b> ${escapeHtml(recruitment.phone)}</p>
          <p>Our recruitment team will contact you soon.</p>
          <p style="color:#666;font-size:12px;margin-top:24px;">VSS SOFTWARE</p>
        </div>
      `,
    },
    {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
}

export const createRecruitment = async (req, res) => {
  try {
    const cleanData = normalizeRecruitmentPayload(req.body);
    const uploadedFile = await uploadRecruitmentFile(req.file);
    const data = {
      ...cleanData,
      ...uploadedFile,
    };
    const recruitment = new Recruitment(data);
    await recruitment.save();
    sendRecruitmentConfirmationEmail(recruitment).catch((error) => {
      console.error('Recruitment confirmation email error:', error.response?.data || error.message);
    });
    res.status(201).json({ success: true, message: 'Hiring requirement submitted successfully!' });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createEmployerRecruitment = async (req, res) => {
  try {
    const baseData = normalizeRecruitmentPayload(req.body, {
      email: req.user.email,
      phone: req.user.phone,
      companyName: req.user.institution,
    });
    const uploadedFile = await uploadRecruitmentFile(req.file);
    const data = {
      ...baseData,
      user: req.user._id,
      ...uploadedFile,
      source: 'employer_dashboard',
    };

    const recruitment = new Recruitment(data);
    await recruitment.save();
    sendRecruitmentConfirmationEmail(recruitment).catch((error) => {
      console.error('Recruitment confirmation email error:', error.response?.data || error.message);
    });
    res.status(201).json({ success: true, message: 'Job requirement posted successfully!', data: recruitment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const listRecruitments = async (req, res) => {
  try {
    const recruitments = await Recruitment.find().sort({ createdAt: -1 });
    res.json(recruitments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const listEmployerRecruitments = async (req, res) => {
  try {
    const scope = req.user.role === 'admin' ? {} : { user: req.user._id };
    const recruitments = await Recruitment.find(scope).sort({ createdAt: -1 });
    res.json({ success: true, data: recruitments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
