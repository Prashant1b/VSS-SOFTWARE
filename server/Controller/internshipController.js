import crypto from 'crypto';
import axios from 'axios';
import InternshipApplication from '../models/InternshipApplication.js';
import InternshipDomain from '../models/InternshipDomain.js';

const INTERNSHIP_AMOUNT = 699;
const cleanEnv = (value) => String(value || '').trim().replace(/^"|"$/g, '');
const normalizePhone = (phone) => String(phone || '').replace(/\D/g, '').slice(0, 10);

function getRazorpayConfig() {
  const keyId = cleanEnv(process.env.RAZORPAY_KEY_ID);
  const keySecret = cleanEnv(process.env.RAZORPAY_KEY_SECRET);

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are missing in environment variables');
  }

  return { keyId, keySecret };
}

function validateApplicationPayload(payload) {
  const cleanPhone = normalizePhone(payload.phone);

  if (!payload.name || !payload.email || !cleanPhone || !payload.college || !payload.track || !payload.duration) {
    throw new Error('Please fill all required internship fields');
  }

  if (!/^\d{10}$/.test(cleanPhone)) {
    throw new Error('Mobile number must be 10 digits');
  }

  if (!['1-month', '3-month', '6-month'].includes(payload.duration)) {
    throw new Error('Invalid internship duration selected');
  }

  return {
    name: String(payload.name).trim(),
    email: String(payload.email).trim().toLowerCase(),
    phone: cleanPhone,
    college: String(payload.college).trim(),
    track: String(payload.track).trim(),
    duration: payload.duration,
    portfolio: String(payload.portfolio || '').trim(),
    message: String(payload.message || '').trim(),
  };
}

function getPlanState(duration, talentScholarship) {
  if (duration === '6-month' && talentScholarship) {
    return {
      planType: 'talent_free_review',
      status: 'interview_pending',
      interviewStatus: 'pending',
      amount: 0,
    };
  }

  if (duration === '6-month') {
    return {
      planType: 'paid',
      status: 'payment_pending',
      interviewStatus: 'not_required',
      amount: INTERNSHIP_AMOUNT,
    };
  }

  return {
    planType: 'free',
    status: 'submitted',
    interviewStatus: 'not_required',
    amount: 0,
  };
}

async function sendInternshipEmail({ to, name, subject, htmlContent }) {
  const BREVO_API_KEY = cleanEnv(process.env.BREVO_API_KEY);
  const FROM_EMAIL = cleanEnv(process.env.FROM_EMAIL);

  if (!BREVO_API_KEY || !FROM_EMAIL || !to) {
    console.warn('Internship email skipped: missing BREVO_API_KEY, FROM_EMAIL, or recipient');
    return;
  }

  await axios.post(
    'https://api.brevo.com/v3/smtp/email',
    {
      sender: {
        email: FROM_EMAIL,
        name: 'VSS SOFTWARE',
      },
      to: [{ email: to, name }],
      subject,
      htmlContent,
    },
    {
      headers: {
        'api-key': BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );
}

function formatInternshipDuration(duration) {
  if (duration === '1-month') return '1 Month';
  if (duration === '3-month') return '3 Months';
  if (duration === '6-month') return '6 Months';
  return duration;
}

async function sendApplicationReceivedEmail(application) {
  const durationLabel = formatInternshipDuration(application.duration);
  const isInterviewRequired = application.planType === 'talent_free_review';
  const nextStep = isInterviewRequired
    ? 'Your profile has been registered for the merit-based free internship review. Our team will schedule your interview soon and share the meeting link with the date and time by email.'
    : 'Our team will review your application and share the next steps with you soon.';

  try {
    await sendInternshipEmail({
      to: application.email,
      name: application.name,
      subject: 'Your VSS Internship Application Has Been Received',
      htmlContent: `
        <div style="font-family:Arial,sans-serif;padding:20px;max-width:560px;margin:auto;color:#111;">
          <h2 style="margin-bottom:10px;">Internship application received</h2>
          <p>Hi ${application.name},</p>
          <p>Thank you for applying for the <b>${durationLabel}</b> internship program at VSS SOFTWARE.</p>
          <p><b>Selected domain:</b> ${application.track}</p>
          <p><b>Selected duration:</b> ${durationLabel}</p>
          <p>${nextStep}</p>
          ${isInterviewRequired ? '<p>Please keep your portfolio, project details, or learning background ready for the discussion.</p>' : ''}
          <p style="color:#666;font-size:12px;margin-top:24px;">VSS SOFTWARE</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Internship interview email error:', error.response?.data || error.message);
  }
}

async function sendPaymentConfirmationEmail(application) {
  const durationLabel = formatInternshipDuration(application.duration);

  try {
    await sendInternshipEmail({
      to: application.email,
      name: application.name,
      subject: 'Your VSS Internship Payment is Confirmed',
      htmlContent: `
        <div style="font-family:Arial,sans-serif;padding:20px;max-width:560px;margin:auto;color:#111;">
          <h2 style="margin-bottom:10px;">Payment confirmed</h2>
          <p>Hi ${application.name},</p>
          <p>We have successfully received your payment of <b>Rs ${application.amount}</b> for the VSS SOFTWARE internship program.</p>
          <p><b>Selected domain:</b> ${application.track}</p>
          <p><b>Selected duration:</b> ${durationLabel}</p>
          <p>Your internship registration is now confirmed. Your offer letter and onboarding details will be shared with you soon.</p>
          <p style="margin-top:20px;"><b>Payment ID:</b> ${application.paymentId || '-'}</p>
          <p style="color:#666;font-size:12px;margin-top:24px;">VSS SOFTWARE</p>
        </div>
      `,
    });
  } catch (error) {
    console.error('Internship payment email error:', error.response?.data || error.message);
  }
}

export const getInternshipDomains = async (req, res) => {
  try {
    const data = await InternshipDomain.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).lean();
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitInternshipApplication = async (req, res) => {
  try {
    const data = validateApplicationPayload(req.body);
    const plan = getPlanState(data.duration, Boolean(req.body.talentScholarship));

    if (data.duration === '6-month' && !req.body.talentScholarship) {
      return res.status(400).json({ success: false, message: 'Please use payment for the 6-month paid internship' });
    }

    const application = await InternshipApplication.create({
      ...data,
      ...plan,
      currency: 'INR',
    });

    await sendApplicationReceivedEmail(application);

    res.status(201).json({
      success: true,
      message: plan.planType === 'talent_free_review'
        ? 'Application submitted. Free 6-month internship needs interview clearance.'
        : 'Internship application submitted successfully.',
      data: application,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const createInternshipPaymentOrder = async (req, res) => {
  try {
    const data = validateApplicationPayload({ ...req.body, duration: '6-month' });
    const { keyId, keySecret } = getRazorpayConfig();
    const receipt = `intern-${Date.now()}`.slice(0, 40);

    const orderResponse = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: INTERNSHIP_AMOUNT * 100,
        currency: 'INR',
        receipt,
        notes: {
          type: 'internship',
          duration: '6-month',
          email: data.email,
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const application = await InternshipApplication.create({
      ...data,
      duration: '6-month',
      planType: 'paid',
      status: 'payment_pending',
      interviewStatus: 'not_required',
      amount: INTERNSHIP_AMOUNT,
      currency: 'INR',
      paymentOrderId: orderResponse.data.id,
    });

    res.json({
      success: true,
      key: keyId,
      order: orderResponse.data,
      application,
    });
  } catch (error) {
    const message = error.response?.data?.error?.description || error.message;
    res.status(500).json({ success: false, message });
  }
};

export const verifyInternshipPayment = async (req, res) => {
  try {
    const {
      applicationId,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    if (!applicationId || !orderId || !paymentId || !signature) {
      return res.status(400).json({ success: false, message: 'Incomplete payment verification payload' });
    }

    const { keySecret } = getRazorpayConfig();
    const generatedSignature = crypto
      .createHmac('sha256', keySecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (generatedSignature !== signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed' });
    }

    const application = await InternshipApplication.findOne({
      _id: applicationId,
      paymentOrderId: orderId,
      planType: 'paid',
    });

    if (!application) {
      return res.status(404).json({ success: false, message: 'Internship application not found' });
    }

    application.status = 'paid';
    application.paymentId = paymentId;
    application.paymentSignature = signature;
    application.paidAt = new Date();
    await application.save();

    await sendPaymentConfirmationEmail(application);

    res.json({
      success: true,
      message: 'Payment successful. Internship application is confirmed.',
      data: application,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
