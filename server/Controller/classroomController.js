import Enrollment from '../models/Enrollment.js';
import Batch from '../models/Batch.js';
import ClassSession from '../models/ClassSession.js';
import { createLiveKitToken, getLiveKitConfig } from '../config/livekit.js';

const mapEnrollmentCard = (item) => ({
  _id: item._id,
  course: item.course,
  courseSlug: item.courseSlug,
  batchId: item.batchId,
  batchName: item.batchName,
  status: item.status,
  paidAt: item.paidAt,
});

export const getMyClassrooms = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ user: req.user._id, status: 'paid', source: 'dashboard_enrollment' })
      .sort({ paidAt: -1, createdAt: -1 });

    res.json({
      success: true,
      data: enrollments.map(mapEnrollmentCard),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourseClassroom = async (req, res) => {
  try {
    const enrollment = await Enrollment.findOne({
      user: req.user._id,
      courseSlug: req.params.courseSlug,
      status: 'paid',
      source: 'dashboard_enrollment',
    });

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'You do not have access to this course' });
    }

    if (!enrollment.batchId) {
      return res.json({
        success: true,
        enrollment: mapEnrollmentCard(enrollment),
        batch: null,
        liveClasses: [],
        recordedClasses: [],
      });
    }

    const batch = await Batch.findById(enrollment.batchId).lean();
    if (!batch) {
      return res.json({
        success: true,
        enrollment: mapEnrollmentCard(enrollment),
        batch: null,
        liveClasses: [],
        recordedClasses: [],
      });
    }

    const sessions = await ClassSession.find({ batch: batch._id, isPublished: true }).sort({ scheduledFor: 1, createdAt: -1 }).lean();
    const now = Date.now();

    const liveClasses = sessions.filter((item) => item.sessionType === 'live' && (!item.scheduledFor || new Date(item.scheduledFor).getTime() >= now - 2 * 60 * 60 * 1000));
    const recordedClasses = sessions.filter((item) => item.sessionType === 'recorded');

    res.json({
      success: true,
      enrollment: mapEnrollmentCard(enrollment),
      batch,
      liveClasses,
      recordedClasses,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getLiveClassAccess = async (req, res) => {
  try {
    const item = await ClassSession.findById(req.params.classId).lean();
    if (!item || item.sessionType !== 'live' || !item.isPublished) {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    let canPublish = false;
    let canSubscribe = true;

    if (['teacher', 'admin'].includes(req.user.role)) {
      canPublish = true;
    } else {
      const enrollment = await Enrollment.findOne({
        user: req.user._id,
        batchId: item.batch,
        status: 'paid',
        source: 'dashboard_enrollment',
      });

      if (!enrollment) {
        return res.status(403).json({ success: false, message: 'You do not have access to this live class' });
      }

      if (item.liveStatus !== 'live') {
        return res.status(409).json({ success: false, message: 'This live class has not started yet' });
      }
    }

    const roomName = item.liveRoomName || `vss-${item.courseSlug}-${item._id}`.replace(/[^a-zA-Z0-9_-]/g, '-');
    const token = await createLiveKitToken({
      identity: `${req.user.role}-${req.user._id}-${item._id}`,
      name: req.user.name,
      roomName,
      canPublish,
      canSubscribe,
      canPublishData: true,
      metadata: {
        appRole: req.user.role,
        userId: String(req.user._id),
        classId: String(item._id),
        batchId: String(item.batch),
      },
    });

    res.json({
      success: true,
      livekit: {
        serverUrl: getLiveKitConfig().serverUrl,
        token,
        roomName,
        canPublish,
      },
      classSession: item,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
