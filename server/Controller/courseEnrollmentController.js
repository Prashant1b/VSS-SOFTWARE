import crypto from 'crypto';
import axios from 'axios';
import Enrollment from '../models/Enrollment.js';
import Course from '../models/Course.js';

const cleanEnv = (value) => String(value || '').trim().replace(/^"|"$/g, '');

const CLASS_OPTIONS = {
  online: { label: 'Online Classes', amountKey: 'onlineAmount' },
  hybrid: { label: 'Hybrid Classes', amountKey: 'hybridAmount' },
  offline: { label: 'Offline Classes', amountKey: 'offlineAmount' },
};

function getRazorpayConfig() {
  const keyId = cleanEnv(process.env.RAZORPAY_KEY_ID);
  const keySecret = cleanEnv(process.env.RAZORPAY_KEY_SECRET);

  if (!keyId || !keySecret) {
    throw new Error('Razorpay keys are missing in environment variables');
  }

  return { keyId, keySecret };
}

function getEnrollmentState(enrollment) {
  if (!enrollment) {
    return {
      enrolled: false,
      demoBooked: false,
      status: 'not_started',
      enrollment: null,
    };
  }

  return {
    enrolled: enrollment.status === 'paid',
    demoBooked: Boolean(enrollment.demoSlotAt),
    status: enrollment.status,
    enrollment,
  };
}

async function getCourseBySlug(courseSlug) {
  return Course.findOne({ slug: courseSlug, isActive: true }).lean();
}

function getClassOption(course, classMode) {
  const option = CLASS_OPTIONS[classMode];
  if (!option) return null;

  const amount = Number(course?.[option.amountKey] || 0);
  if (!Number.isFinite(amount) || amount <= 0) {
    return null;
  }

  return { label: option.label, amount };
}

export const getMyCourseEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id, source: 'dashboard_enrollment' })
      .sort({ paidAt: -1, createdAt: -1 });

    res.json({
      success: true,
      data: enrollments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseEnrollmentStatus = async (req, res) => {
  try {
    const course = await getCourseBySlug(req.params.courseSlug);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      courseSlug: course.slug,
      source: 'dashboard_enrollment',
    });

    res.json({ success: true, ...getEnrollmentState(enrollment) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const scheduleDemoSlot = async (req, res) => {
  try {
    const { courseSlug, slotDate, slotTime, timezone, notes } = req.body;
    const course = await getCourseBySlug(courseSlug);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!slotDate || !slotTime) {
      return res.status(400).json({ success: false, message: 'Please choose a demo date and time slot' });
    }

    const slotAt = new Date(`${slotDate}T${slotTime}:00`);
    if (Number.isNaN(slotAt.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid demo slot selected' });
    }

    if (slotAt.getTime() <= Date.now()) {
      return res.status(400).json({ success: false, message: 'Please choose a future time slot' });
    }

    const existing = await Enrollment.findOne({
      user: req.user._id,
      courseSlug: course.slug,
      source: 'dashboard_enrollment',
    });

    if (existing?.status === 'paid') {
      return res.status(400).json({ success: false, message: 'You are already enrolled in this course' });
    }

    const enrollment = await Enrollment.findOneAndUpdate(
      { user: req.user._id, courseSlug: course.slug, source: 'dashboard_enrollment' },
      {
        user: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || 'Not provided',
        institution: req.user.institution || '',
        course: course.title,
        courseSlug: course.slug,
        source: 'dashboard_enrollment',
        status: existing?.status === 'payment_pending' ? 'payment_pending' : 'demo_booked',
        demoSlotAt: slotAt,
        demoTimezone: timezone || 'Asia/Kolkata',
        demoNotes: String(notes || '').trim(),
        demoVideoUrl: course.demoVideoUrl,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      message: 'Demo class scheduled successfully',
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPaymentOrder = async (req, res) => {
  try {
    const { courseSlug, classMode = 'online' } = req.body;
    const course = await getCourseBySlug(courseSlug);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const existing = await Enrollment.findOne({
      user: req.user._id,
      courseSlug: course.slug,
      source: 'dashboard_enrollment',
    });

    if (existing?.status === 'paid') {
      return res.status(400).json({
        success: false,
        message: 'You are already enrolled in this course',
        data: existing,
      });
    }

    const { keyId, keySecret } = getRazorpayConfig();
    const classOption = getClassOption(course, classMode);
    if (!classOption) {
      return res.status(400).json({ success: false, message: 'Selected class mode price is missing. Update online, hybrid, and offline prices in admin.' });
    }
    const amount = classOption.amount;

    const currency = course.currency || 'INR';
    const amountInPaise = amount * 100;
    const receipt = `${course.slug}-${req.user._id}-${Date.now()}`.slice(0, 40);

    const orderResponse = await axios.post(
      'https://api.razorpay.com/v1/orders',
      {
        amount: amountInPaise,
        currency,
        receipt,
        notes: {
          courseSlug: course.slug,
          classMode,
          classModeLabel: classOption.label,
          userId: String(req.user._id),
          email: req.user.email,
        },
      },
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${keyId}:${keySecret}`).toString('base64')}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const enrollment = await Enrollment.findOneAndUpdate(
      { user: req.user._id, courseSlug: course.slug, source: 'dashboard_enrollment' },
      {
        user: req.user._id,
        name: req.user.name,
        email: req.user.email,
        phone: req.user.phone || 'Not provided',
        institution: req.user.institution || '',
        course: course.title,
        courseSlug: course.slug,
        classMode,
        classModeLabel: classOption.label,
        source: 'dashboard_enrollment',
        status: 'payment_pending',
        amount,
        currency,
        paymentOrderId: orderResponse.data.id,
        paymentId: undefined,
        paymentSignature: undefined,
        paidAt: undefined,
        demoVideoUrl: course.demoVideoUrl,
      },
      { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true }
    );

    res.json({
      success: true,
      key: keyId,
      course,
      order: orderResponse.data,
      enrollment,
    });
  } catch (error) {
    const message = error.response?.data?.error?.description || error.message;
    res.status(500).json({ success: false, message });
  }
};

export const verifyCoursePayment = async (req, res) => {
  try {
    const {
      courseSlug,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: signature,
    } = req.body;

    const course = await getCourseBySlug(courseSlug);
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!orderId || !paymentId || !signature) {
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

    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      courseSlug: course.slug,
      paymentOrderId: orderId,
      source: 'dashboard_enrollment',
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment record not found' });
    }

    enrollment.status = 'paid';
    enrollment.paymentId = paymentId;
    enrollment.paymentSignature = signature;
    enrollment.paidAt = new Date();
    enrollment.currency = course.currency || 'INR';
    enrollment.demoVideoUrl = course.demoVideoUrl;
    await enrollment.save();

    await req.user.updateOne({
      $addToSet: {
        enrolledCourses: course.slug,
      },
    });

    res.json({
      success: true,
      message: 'Payment verified and enrollment completed',
      data: enrollment,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
