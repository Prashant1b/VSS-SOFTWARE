import User from '../models/User.js';
import Otp from '../models/otp.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import redisClient from '../config/redis.js';

const OTP_EXPIRY_MS = 5 * 60 * 1000;

// ================= UTIL =================
const cleanEnv = (value) => String(value || '').trim().replace(/^"|"$/g, '');

const issueAuth = (res, user) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '5d' }
  );

 res.cookie('token', token, {
  httpOnly: true,
  secure: false, // true in production (HTTPS)
  sameSite: 'lax'
})
};

const sendOtpEmail = async (email, otp, purpose) => {
  try {
    const BREVO_API_KEY = String(process.env.BREVO_API_KEY || '').trim();
    const FROM_EMAIL = String(process.env.FROM_EMAIL || '').trim();

    if (!BREVO_API_KEY) {
      throw new Error('BREVO_API_KEY missing');
    }

    if (!FROM_EMAIL) {
      throw new Error('FROM_EMAIL missing');
    }

    if (!email) {
      throw new Error('Recipient email missing');
    }

    const response = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          email: FROM_EMAIL,
          name: 'VSS SOFTWARE',
        },
        to: [{ email }],
        subject: `OTP for ${purpose}`,
        htmlContent: `
  <div style="font-family:Arial,sans-serif;padding:20px;max-width:500px;margin:auto;color:#111;">
    
    <h2 style="margin-bottom:10px;">Your verification code</h2>

    <p style="margin-bottom:20px;">
      Use this OTP to continue your ${purpose} request.
    </p>

    <div style="font-size:28px;font-weight:bold;letter-spacing:6px;
      margin:20px 0;padding:10px 0;">
      ${otp}
    </div>

    <p style="margin-bottom:10px;">
      This OTP is valid for <b>5 minutes</b>.
    </p>

    <p style="color:#666;font-size:12px;">
      If you didn't request this, ignore this email.
    </p>

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

  } catch (error) {
    console.error(
      'Brevo Email Error:',
      error.response?.data || error.message
    );
    throw new Error('Failed to send OTP email');
  }
};
// ================= OTP =================
const generateOtp = () => String(Math.floor(100000 + Math.random() * 900000));

const verifyOtpFromDb = async (email, purpose, otp, consume = true) => {
  const record = await Otp.findOne({ email, purpose });

  if (!record) throw new Error('OTP not found');

  if (record.expiresAt < Date.now()) {
    await Otp.deleteOne({ _id: record._id });
    throw new Error('OTP expired');
  }

  const match = await bcrypt.compare(otp, record.otpHash);

  if (!match) {
    record.attempts += 1;
    if (record.attempts >= 5) {
      await Otp.deleteOne({ _id: record._id });
      throw new Error('Too many attempts');
    }
    await record.save();
    throw new Error('Invalid OTP');
  }

  if (consume) await Otp.deleteOne({ _id: record._id });

  return true;
};

// ================= AUTH =================
export const registerWithOtp = async (req, res) => {
  try {
    const { name, email, password, phone, role, institution, otp } = req.body;

    const cleanEmail = String(email).trim().toLowerCase();

    if (!name || !cleanEmail || !password)
      return res.status(400).json({ message: 'Missing fields' });

    if (!otp) return res.status(400).json({ message: 'OTP required' });

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    await verifyOtpFromDb(cleanEmail, 'signup', otp, true);

    const hashed = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashed,
      phone,
      role: role || 'student',
      institution,
    });

    issueAuth(res, user);

    const safeUser = await User.findById(user._id).select('-password');

    res.status(201).json({ message: 'Registered', user: safeUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const sendOtp = async (req, res) => {
  try {
    const { email, purpose = 'login' } = req.body;
   const cleanEmail = String(email || '').trim().toLowerCase();

if (!cleanEmail) {
  return res.status(400).json({ message: "Email required" });
}

    const user = await User.findOne({ email: cleanEmail });

    if (purpose === 'signup' && user)
      return res.status(400).json({ message: 'User exists' });

    if ((purpose === 'login' || purpose === 'reset') && !user)
      return res.status(404).json({ message: 'User not found' });

    const otp = generateOtp();
    const otpHash = await bcrypt.hash(otp, 10);

    await Otp.findOneAndUpdate(
      { email: cleanEmail, purpose },
      {
        email: cleanEmail,
        purpose,
        otpHash,
        expiresAt: new Date(Date.now() + OTP_EXPIRY_MS),
        attempts: 0,
      },
      { upsert: true }
    );

    await sendOtpEmail(cleanEmail, otp, purpose);

    res.json({ message: 'OTP sent' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    issueAuth(res, user);

    const safeUser = await User.findById(user._id).select('-password');

    res.json({ message: 'Logged in', user: safeUser });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const loginWithOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await verifyOtpFromDb(email, 'login', otp, true);

    issueAuth(res, user);

    const safeUser = await User.findById(user._id).select('-password');

    res.json({ message: 'Logged in with OTP', user: safeUser });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const logout = async (req, res) => {
  const token = req.cookies.token;

  if (token) {
    const payload = jwt.decode(token);
    await redisClient.set(`blocked_${token}`, 'blocked');

    if (payload?.exp) {
      await redisClient.expireAt(`blocked_${token}`, payload.exp);
    }
  }

  res.clearCookie('token');
  res.json({ message: 'Logged out' });
};

export const getProfile = async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(payload.id).select('-password');

    res.json({ user });
  } catch {
    res.status(401).json({ message: 'Unauthorized' });
  }
};

export const resetPasswordWithOtp = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    await verifyOtpFromDb(email, 'reset', otp, true);

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password reset successful' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const UpdateProfile = async (req, res) => {
  try {
    const { name, phone, institution } = req.body;
    const user = req.user;

    if (name) user.name = name;
    if (phone) user.phone = phone;
    if (institution) user.institution = institution;

    await user.save();
    res.json({ success: true, message: 'Profile updated', user: user.toJSON() });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
