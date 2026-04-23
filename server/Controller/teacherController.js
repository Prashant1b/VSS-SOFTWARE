import Batch from '../models/Batch.js';
import ClassSession from '../models/ClassSession.js';
import Course from '../models/Course.js';
import Enrollment from '../models/Enrollment.js';
import { createLiveKitToken, getLiveKitConfig, getLiveKitRoomClient } from '../config/livekit.js';

const teacherScope = (user) => (user.role === 'admin' ? {} : { teacher: user._id });
const teacherEditableScope = (user) => (user.role === 'admin' ? {} : { teacher: user._id });
const buildRoomName = (session) => session.liveRoomName || `vss-${session.courseSlug}-${session._id}`.replace(/[^a-zA-Z0-9_-]/g, '-');

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const getTeacherOverview = async (req, res) => {
  try {
    const batchIds = await Batch.find({ isActive: true, ...teacherScope(req.user) }).distinct('_id');
    const ownedClassScope = teacherScope(req.user);
    const [batches, classes, liveClasses, recordings, students] = await Promise.all([
      Batch.countDocuments({ isActive: true, ...teacherScope(req.user) }),
      ClassSession.countDocuments(ownedClassScope),
      ClassSession.countDocuments({ ...ownedClassScope, sessionType: 'live', isPublished: true }),
      ClassSession.countDocuments({ ...ownedClassScope, sessionType: 'recorded', isPublished: true }),
      Enrollment.countDocuments({ batchId: { $in: batchIds }, status: 'paid' }),
    ]);

    res.json({
      success: true,
      stats: { batches, classes, liveClasses, recordings, students },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeacherCourses = async (_req, res) => {
  try {
    const courses = await Course.find({ isActive: true }).sort({ order: 1, createdAt: -1 }).select('title slug');
    res.json({ success: true, data: courses });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeacherBatches = async (req, res) => {
  try {
    const scope = teacherScope(req.user);
    const data = await Batch.find({ isActive: true, ...scope }).sort({ courseTitle: 1, title: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTeacherBatch = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can create batches' });
    }

    const { title, courseSlug, description, startDate, liveClassUrl, isActive } = req.body;
    const course = await Course.findOne({ slug: courseSlug });
    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    const batch = await Batch.create({
      title,
      courseSlug: course.slug,
      courseTitle: course.title,
      teacher: req.user._id,
      teacherName: req.user.name,
      description: String(description || '').trim(),
      startDate: normalizeDate(startDate),
      liveClassUrl: String(liveClassUrl || '').trim(),
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });

    res.status(201).json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTeacherBatch = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can update batches' });
    }

    const scope = teacherEditableScope(req.user);
    const batch = await Batch.findOne({ _id: req.params.id, ...scope });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (req.body.courseSlug) {
      const course = await Course.findOne({ slug: req.body.courseSlug });
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      batch.courseSlug = course.slug;
      batch.courseTitle = course.title;
    }

    if (req.body.title !== undefined) batch.title = req.body.title;
    if (req.body.description !== undefined) batch.description = String(req.body.description || '').trim();
    if (req.body.startDate !== undefined) batch.startDate = normalizeDate(req.body.startDate);
    if (req.body.liveClassUrl !== undefined) batch.liveClassUrl = String(req.body.liveClassUrl || '').trim();
    if (req.body.isActive !== undefined) batch.isActive = Boolean(req.body.isActive);
    batch.teacherName = req.user.name;

    await batch.save();
    res.json({ success: true, data: batch });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTeacherBatch = async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admin can delete batches' });
    }

    const scope = teacherEditableScope(req.user);
    const batch = await Batch.findOne({ _id: req.params.id, ...scope });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    await ClassSession.deleteMany({ batch: batch._id });
    await Enrollment.updateMany({ batchId: batch._id }, { $set: { batchId: null, batchName: '' } });
    await batch.deleteOne();

    res.json({ success: true, message: 'Batch deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeacherClasses = async (req, res) => {
  try {
    const batch = await Batch.findOne({ _id: req.params.batchId, ...teacherScope(req.user) });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const classes = await ClassSession.find({ batch: batch._id }).sort({ scheduledFor: 1, createdAt: -1 });
    res.json({ success: true, batch, data: classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTeacherClassesIndex = async (req, res) => {
  try {
    const scope = teacherScope(req.user);
    const batchScope = { isActive: true, ...scope };

    const [batches, classes] = await Promise.all([
      Batch.find(batchScope).select('_id title courseSlug courseTitle teacher teacherName isActive').lean(),
      ClassSession.find(scope).sort({ liveStatus: -1, scheduledFor: 1, createdAt: -1 }).lean(),
    ]);

    const batchMap = new Map(batches.map((batch) => [String(batch._id), batch]));
    const data = classes
      .map((item) => ({
        ...item,
        batchDetails: batchMap.get(String(item.batch)) || null,
      }))
      .filter((item) => item.batchDetails || req.user.role === 'admin');

    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTeacherClass = async (req, res) => {
  try {
    const batch = await Batch.findOne({ _id: req.body.batchId, isActive: true, ...teacherScope(req.user) });
    if (!batch) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    const item = await ClassSession.create({
      batch: batch._id,
      courseSlug: batch.courseSlug,
      teacher: req.user._id,
      title: req.body.title,
      description: String(req.body.description || '').trim(),
      sessionType: req.body.sessionType,
      scheduledFor: normalizeDate(req.body.scheduledFor),
      durationMinutes: Number(req.body.durationMinutes || 60),
      liveRoomName: String(req.body.liveRoomName || '').trim(),
      liveStatus: req.body.sessionType === 'live' ? 'scheduled' : 'idle',
      liveMeetingUrl: req.body.sessionType === 'live' ? '' : String(req.body.liveMeetingUrl || '').trim(),
      recordingUrl: String(req.body.recordingUrl || '').trim(),
      notesUrl: String(req.body.notesUrl || '').trim(),
      isPublished: req.body.isPublished !== false,
    });

    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTeacherClass = async (req, res) => {
  try {
    const scope = teacherEditableScope(req.user);
    const item = await ClassSession.findOne({ _id: req.params.id, ...scope });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    if (req.body.batchId && String(req.body.batchId) !== String(item.batch)) {
      const batch = await Batch.findOne({ _id: req.body.batchId, isActive: true });
      if (!batch) {
        return res.status(404).json({ success: false, message: 'Batch not found' });
      }
      item.batch = batch._id;
      item.courseSlug = batch.courseSlug;
    }

    if (req.body.title !== undefined) item.title = req.body.title;
    if (req.body.description !== undefined) item.description = String(req.body.description || '').trim();
    if (req.body.sessionType !== undefined) item.sessionType = req.body.sessionType;
    if (req.body.scheduledFor !== undefined) item.scheduledFor = normalizeDate(req.body.scheduledFor);
    if (req.body.durationMinutes !== undefined) item.durationMinutes = Number(req.body.durationMinutes || 60);
    if (req.body.liveRoomName !== undefined) item.liveRoomName = String(req.body.liveRoomName || '').trim();
    if (req.body.liveMeetingUrl !== undefined) item.liveMeetingUrl = item.sessionType === 'live' ? '' : String(req.body.liveMeetingUrl || '').trim();
    if (req.body.recordingUrl !== undefined) item.recordingUrl = String(req.body.recordingUrl || '').trim();
    if (req.body.notesUrl !== undefined) item.notesUrl = String(req.body.notesUrl || '').trim();
    if (req.body.isPublished !== undefined) item.isPublished = Boolean(req.body.isPublished);
    if (item.sessionType === 'live' && item.liveStatus === 'idle') {
      item.liveStatus = 'scheduled';
    }
    if (item.sessionType === 'live') {
      item.liveMeetingUrl = '';
    }

    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTeacherClass = async (req, res) => {
  try {
    const scope = teacherEditableScope(req.user);
    const item = await ClassSession.findOne({ _id: req.params.id, ...scope });
    if (!item) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    await item.deleteOne();
    res.json({ success: true, message: 'Class deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const startTeacherLiveClass = async (req, res) => {
  try {
    const scope = teacherEditableScope(req.user);
    const item = await ClassSession.findOne({ _id: req.params.id, ...scope });
    if (!item || item.sessionType !== 'live') {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const roomName = buildRoomName(item);
    const roomClient = getLiveKitRoomClient();

    try {
      await roomClient.createRoom({
        name: roomName,
        emptyTimeout: 60 * 10,
        maxParticipants: 500,
      });
    } catch (error) {
      const message = String(error?.message || '');
      if (!message.toLowerCase().includes('already exists')) {
        throw error;
      }
    }

    item.liveRoomName = roomName;
    item.liveStatus = 'live';
    item.liveStartedAt = new Date();
    item.liveEndedAt = null;
    await item.save();

    const token = await createLiveKitToken({
      identity: `teacher-${req.user._id}-${item._id}`,
      name: req.user.name,
      roomName,
      canPublish: true,
      canSubscribe: true,
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
      data: item,
      livekit: {
        serverUrl: getLiveKitConfig().serverUrl,
        token,
        roomName,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const endTeacherLiveClass = async (req, res) => {
  try {
    const scope = teacherEditableScope(req.user);
    const item = await ClassSession.findOne({ _id: req.params.id, ...scope });
    if (!item || item.sessionType !== 'live') {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    item.liveStatus = 'ended';
    item.liveEndedAt = new Date();
    await item.save();

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const removeLiveParticipant = async (req, res) => {
  try {
    const scope = teacherEditableScope(req.user);
    const item = await ClassSession.findOne({ _id: req.params.id, ...scope });
    if (!item || item.sessionType !== 'live') {
      return res.status(404).json({ success: false, message: 'Live class not found' });
    }

    const roomName = buildRoomName(item);
    const identity = decodeURIComponent(String(req.params.identity || ''));
    if (!identity) {
      return res.status(400).json({ success: false, message: 'Participant identity is required' });
    }

    const roomClient = getLiveKitRoomClient();
    const participant = await roomClient.getParticipant(roomName, identity);
    const metadata = JSON.parse(participant.metadata || '{}');

    if (['teacher', 'admin'].includes(metadata.appRole)) {
      return res.status(403).json({ success: false, message: 'Teacher or admin cannot be removed from here' });
    }

    await roomClient.removeParticipant(roomName, identity);

    res.json({ success: true, message: 'Student removed from live room' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
