import Placement from '../models/Placement.js';
import axios from 'axios';
import path from 'path';
import Course from '../models/Course.js';
import Testimonial from '../models/Testimonial.js';
import HiringDrive from '../models/HiringDrive.js';
import SiteStat from '../models/SiteStat.js';
import Partner from '../models/Partner.js';
import User from '../models/User.js';
import Contact from '../models/Contact.js';
import Enrollment from '../models/Enrollment.js';
import Recruitment from '../models/Recruitment.js';
import Batch from '../models/Batch.js';
import ClassSession from '../models/ClassSession.js';
import InternshipApplication from '../models/InternshipApplication.js';
import InternshipDomain from '../models/InternshipDomain.js';
import Resource from '../models/Resource.js';

const normalizeListInput = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    return value
      .split(/\r?\n|,/)
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

const toSafePublicId = (value) => String(value || '')
  .trim()
  .toLowerCase()
  .replace(/\.[^.]+$/, '')
  .replace(/[^a-z0-9-_]+/g, '-')
  .replace(/^-+|-+$/g, '') || 'resource-file';

const normalizeCoursePayload = (payload) => ({
  ...payload,
  classLocation: String(payload.classLocation || payload.location || '').trim(),
  classLocationUrl: String(payload.classLocationUrl || payload.locationUrl || payload.mapUrl || '').trim(),
  features: normalizeListInput(payload.features),
  techStack: normalizeListInput(payload.techStack),
  highlights: normalizeListInput(payload.highlights),
});

const enrollmentClassModes = {
  online: 'Online Classes',
  hybrid: 'Hybrid Classes',
  offline: 'Offline Classes',
};

const validClassModes = Object.keys(enrollmentClassModes);
const cleanEnv = (value) => String(value || '').trim().replace(/^"|"$/g, '');

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

function getSupabaseResourceStorageConfig() {
  const url = cleanEnv(process.env.SUPABASE_URL);
  const serviceRoleKey = cleanEnv(process.env.SUPABASE_SERVICE_ROLE_KEY);
  const bucket = cleanEnv(process.env.SUPABASE_RESOURCE_BUCKET) || 'resource-files';

  if (!url || !serviceRoleKey) {
    throw new Error('Supabase Storage is not configured. Add SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to server environment.');
  }

  return {
    url: url.replace(/\/$/, ''),
    serviceRoleKey,
    bucket,
  };
}

async function uploadResourceFile(file) {
  if (!file) return {};

  const { url, serviceRoleKey, bucket } = getSupabaseResourceStorageConfig();
  const ext = path.extname(file.originalname).toLowerCase();
  const fileName = `${toSafePublicId(file.originalname)}-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
  const storagePath = `resources/${new Date().getFullYear()}/${fileName}`;

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
    fileName,
    fileUrl: '',
    fileOriginalName: file.originalname,
    fileStorageProvider: 'supabase',
    fileStoragePath: storagePath,
  };
}

export const getDashboardStats = async (req, res) => {
  try {
    const [users, contacts, enrollments, recruitments, placements, courses, internships, internshipDomains] = await Promise.all([
      User.countDocuments(),
      Contact.countDocuments(),
      Enrollment.countDocuments(),
      Recruitment.countDocuments(),
      Placement.countDocuments(),
      Course.countDocuments(),
      InternshipApplication.countDocuments(),
      InternshipDomain.countDocuments(),
    ]);

    res.json({ success: true, stats: { users, contacts, enrollments, recruitments, placements, courses, internships, internshipDomains } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const allowedRoles = ['student', 'employer', 'teacher', 'admin'];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role selected' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (role === 'admin' && user.role !== 'admin') {
      user.previousRoleBeforeAdmin = user.role;
    }

    if (user.role === 'admin' && role !== 'admin') {
      user.previousRoleBeforeAdmin = undefined;
    }

    user.role = role;
    await user.save({ validateModifiedOnly: true });

    res.json({ success: true, message: 'User role updated', data: user.toJSON() });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlacements = async (req, res) => {
  try {
    const data = await Placement.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPlacement = async (req, res) => {
  try {
    const item = new Placement(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePlacement = async (req, res) => {
  try {
    const item = await Placement.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePlacement = async (req, res) => {
  try {
    await Placement.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Placement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getCourses = async (req, res) => {
  try {
    const data = await Course.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createCourse = async (req, res) => {
  try {
    const payload = normalizeCoursePayload(req.body);
    const item = new Course(payload);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateCourse = async (req, res) => {
  try {
    const payload = normalizeCoursePayload(req.body);
    const item = await Course.findByIdAndUpdate(req.params.id, { $set: payload }, { returnDocument: 'after', runValidators: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteCourse = async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTestimonials = async (req, res) => {
  try {
    const data = await Testimonial.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createTestimonial = async (req, res) => {
  try {
    const item = new Testimonial(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateTestimonial = async (req, res) => {
  try {
    const item = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteTestimonial = async (req, res) => {
  try {
    await Testimonial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Testimonial deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getHiringDrives = async (req, res) => {
  try {
    const data = await HiringDrive.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createHiringDrive = async (req, res) => {
  try {
    const item = new HiringDrive(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateHiringDrive = async (req, res) => {
  try {
    const item = await HiringDrive.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteHiringDrive = async (req, res) => {
  try {
    await HiringDrive.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Hiring drive deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSiteStats = async (req, res) => {
  try {
    const data = await SiteStat.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSiteStat = async (req, res) => {
  try {
    const item = new SiteStat(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateSiteStat = async (req, res) => {
  try {
    const item = await SiteStat.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteSiteStat = async (req, res) => {
  try {
    await SiteStat.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Stat deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPartners = async (req, res) => {
  try {
    const data = await Partner.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createPartner = async (req, res) => {
  try {
    const item = new Partner(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updatePartner = async (req, res) => {
  try {
    const item = await Partner.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deletePartner = async (req, res) => {
  try {
    await Partner.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Partner deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const normalizeResourcePayload = (payload) => ({
  type: String(payload.type || '').trim(),
  title: String(payload.title || '').trim(),
  desc: String(payload.desc || '').trim(),
  category: String(payload.category || '').trim(),
  action: String(payload.action || '').trim(),
  externalUrl: String(payload.externalUrl || '').trim(),
  order: Number(payload.order || 0),
  isActive: payload.isActive === 'false' ? false : Boolean(payload.isActive ?? true),
});

export const getResources = async (req, res) => {
  try {
    const data = await Resource.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createResource = async (req, res) => {
  try {
    const uploadedFile = await uploadResourceFile(req.file);
    const item = new Resource({
      ...normalizeResourcePayload(req.body),
      ...uploadedFile,
    });
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateResource = async (req, res) => {
  try {
    const uploadedFile = await uploadResourceFile(req.file);
    const payload = {
      ...normalizeResourcePayload(req.body),
      ...uploadedFile,
    };
    const item = await Resource.findByIdAndUpdate(req.params.id, { $set: payload }, { returnDocument: 'after', runValidators: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Resource deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getContacts = async (req, res) => {
  try {
    const data = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteContact = async (req, res) => {
  try {
    await Contact.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Contact deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEnrollments = async (req, res) => {
  try {
    const data = await Enrollment.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id);
    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' });
    }

    if (req.body.status) {
      enrollment.status = req.body.status;
    }

    if (req.body.batchId === '' || req.body.batchId === null) {
      enrollment.batchId = null;
      enrollment.batchName = '';
    } else if (req.body.batchId) {
      const batch = await Batch.findById(req.body.batchId);
      if (!batch) {
        return res.status(404).json({ success: false, message: 'Batch not found' });
      }
      if (enrollment.courseSlug && batch.courseSlug !== enrollment.courseSlug) {
        return res.status(400).json({ success: false, message: 'Batch course does not match this enrollment' });
      }
      enrollment.batchId = batch._id;
      enrollment.batchName = batch.title;
    }

    if (req.body.classMode !== undefined) {
      if (req.body.classMode === '') {
        enrollment.classMode = undefined;
        enrollment.classModeLabel = '';
      } else if (enrollmentClassModes[req.body.classMode]) {
        enrollment.classMode = req.body.classMode;
        enrollment.classModeLabel = enrollmentClassModes[req.body.classMode];
      } else {
        return res.status(400).json({ success: false, message: 'Invalid class mode' });
      }
    }

    if (req.body.classLocation !== undefined) {
      enrollment.classLocation = String(req.body.classLocation || '').trim();
    }

    if (req.body.classLocationUrl !== undefined) {
      enrollment.classLocationUrl = String(req.body.classLocationUrl || '').trim();
    }

    await enrollment.save();
    res.json({ success: true, data: enrollment });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteEnrollment = async (req, res) => {
  try {
    await Enrollment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Enrollment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const grantCourseAccess = async (req, res) => {
  try {
    const { userId, courses = [], accessType = 'manual', accessReason = '' } = req.body;
    const allowedAccessTypes = ['manual', 'scholarship', 'free'];
    const cleanAccessType = allowedAccessTypes.includes(accessType) ? accessType : 'manual';
    const cleanAccessReason = String(accessReason || '').trim();

    if (!userId) {
      return res.status(400).json({ success: false, message: 'Please select a student' });
    }

    if (!cleanAccessReason) {
      return res.status(400).json({ success: false, message: 'Please enter why this access is being granted' });
    }

    if (!Array.isArray(courses) || courses.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one course' });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (user.role === 'employer') {
      return res.status(400).json({ success: false, message: 'Course access can only be granted to student, teacher, or admin accounts' });
    }

    const uniqueCourseSlugs = [...new Set(courses.map((item) => String(item.courseSlug || '').trim()).filter(Boolean))];
    if (uniqueCourseSlugs.length === 0) {
      return res.status(400).json({ success: false, message: 'Please select at least one valid course' });
    }

    const courseDocs = await Course.find({ slug: { $in: uniqueCourseSlugs } });
    const courseBySlug = new Map(courseDocs.map((course) => [course.slug, course]));
    const missingCourse = uniqueCourseSlugs.find((slug) => !courseBySlug.has(slug));
    if (missingCourse) {
      return res.status(404).json({ success: false, message: `Course not found: ${missingCourse}` });
    }

    const granted = [];

    for (const requestItem of courses) {
      const courseSlug = String(requestItem.courseSlug || '').trim();
      if (!courseSlug) continue;

      const course = courseBySlug.get(courseSlug);
      const classMode = validClassModes.includes(requestItem.classMode) ? requestItem.classMode : 'online';
      let batchId = null;
      let batchName = '';

      if (requestItem.batchId) {
        const batch = await Batch.findById(requestItem.batchId);
        if (!batch) {
          return res.status(404).json({ success: false, message: `Batch not found for ${course.title}` });
        }
        if (batch.courseSlug !== course.slug) {
          return res.status(400).json({ success: false, message: `Selected batch does not match ${course.title}` });
        }
        batchId = batch._id;
        batchName = batch.title;
      }

      const enrollment = await Enrollment.findOneAndUpdate(
        { user: user._id, courseSlug: course.slug, source: 'dashboard_enrollment' },
        {
          $set: {
            user: user._id,
            name: user.name,
            email: user.email,
            phone: user.phone || 'Not provided',
            institution: user.institution || '',
            course: course.title,
            courseSlug: course.slug,
            classMode,
            classModeLabel: enrollmentClassModes[classMode],
            classLocation: course.classLocation || '',
            classLocationUrl: course.classLocationUrl || '',
            batchId,
            batchName,
            source: 'dashboard_enrollment',
            status: 'paid',
            amount: 0,
            currency: course.currency || 'INR',
            accessType: cleanAccessType,
            accessReason: cleanAccessReason,
            grantedBy: req.user._id,
            grantedByName: req.user.name,
            grantedAt: new Date(),
            paidAt: new Date(),
            demoVideoUrl: course.demoVideoUrl || '',
            message: cleanAccessReason,
          },
          $unset: {
            paymentOrderId: '',
            paymentId: '',
            paymentSignature: '',
          },
        },
        { upsert: true, returnDocument: 'after', setDefaultsOnInsert: true, runValidators: true }
      );

      granted.push(enrollment);
    }

    await User.findByIdAndUpdate(user._id, {
      $addToSet: {
        enrolledCourses: { $each: granted.map((item) => item.courseSlug) },
      },
    });

    res.json({
      success: true,
      message: `Granted access to ${granted.length} course${granted.length === 1 ? '' : 's'}`,
      data: granted,
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const getBatches = async (req, res) => {
  try {
    const data = await Batch.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createBatch = async (req, res) => {
  try {
    const { title, courseSlug, teacherId, description, classLocation, classLocationUrl, startDate, isActive } = req.body;
    const [course, teacher] = await Promise.all([
      Course.findOne({ slug: courseSlug }),
      User.findOne({ _id: teacherId, role: { $in: ['teacher', 'admin'] } }),
    ]);

    if (!course) {
      return res.status(404).json({ success: false, message: 'Course not found' });
    }

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const item = new Batch({
      title,
      courseSlug: course.slug,
      courseTitle: course.title,
      teacher: teacher._id,
      teacherName: teacher.name,
      description: String(description || '').trim(),
      classLocation: String(classLocation || '').trim(),
      classLocationUrl: String(classLocationUrl || '').trim(),
      startDate: startDate ? new Date(startDate) : null,
      isActive: typeof isActive === 'boolean' ? isActive : true,
    });
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateBatch = async (req, res) => {
  try {
    const item = await Batch.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Batch not found' });
    }

    if (req.body.courseSlug) {
      const course = await Course.findOne({ slug: req.body.courseSlug });
      if (!course) {
        return res.status(404).json({ success: false, message: 'Course not found' });
      }
      item.courseSlug = course.slug;
      item.courseTitle = course.title;
    }

    if (req.body.teacherId) {
      const teacher = await User.findOne({ _id: req.body.teacherId, role: { $in: ['teacher', 'admin'] } });
      if (!teacher) {
        return res.status(404).json({ success: false, message: 'Teacher not found' });
      }
      item.teacher = teacher._id;
      item.teacherName = teacher.name;
    }

    if (req.body.title !== undefined) item.title = req.body.title;
    if (req.body.description !== undefined) item.description = String(req.body.description || '').trim();
    if (req.body.classLocation !== undefined) item.classLocation = String(req.body.classLocation || '').trim();
    if (req.body.classLocationUrl !== undefined) item.classLocationUrl = String(req.body.classLocationUrl || '').trim();
    if (req.body.startDate !== undefined) item.startDate = req.body.startDate ? new Date(req.body.startDate) : null;
    if (req.body.isActive !== undefined) item.isActive = Boolean(req.body.isActive);

    await item.save();
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteBatch = async (req, res) => {
  try {
    await Batch.findByIdAndDelete(req.params.id);
    await ClassSession.deleteMany({ batch: req.params.id });
    await Enrollment.updateMany({ batchId: req.params.id }, { $set: { batchId: null, batchName: '' } });
    res.json({ success: true, message: 'Batch deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRecruitments = async (req, res) => {
  try {
    const data = await Recruitment.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const viewRecruitmentFile = async (req, res) => {
  try {
    const item = await Recruitment.findById(req.params.id).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: 'Recruitment record not found' });
    }

    if (item.jdFileStorageProvider === 'supabase' && item.jdFileStoragePath) {
      const { url, serviceRoleKey, bucket } = getSupabaseStorageConfig();
      const fileResponse = await axios.get(
        `${url}/storage/v1/object/${bucket}/${item.jdFileStoragePath}`,
        {
          responseType: 'stream',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      const originalName = item.jdFileOriginalName || item.jdFile || path.basename(item.jdFileStoragePath) || 'recruitment-file';
      const ext = path.extname(originalName).toLowerCase();
      const contentType = fileResponse.headers['content-type']
        || (ext === '.pdf' ? 'application/pdf' : 'application/octet-stream');

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${originalName.replace(/"/g, '')}"`);
      res.setHeader('Cache-Control', 'private, max-age=300');
      return fileResponse.data.pipe(res);
    }

    if (!item.jdFileUrl) {
      if (item.jdFile) {
        return res.redirect(`/api/uploads/${encodeURIComponent(item.jdFile)}`);
      }
      return res.status(404).json({ success: false, message: 'No file uploaded for this recruitment' });
    }

    const fileResponse = await axios.get(item.jdFileUrl, {
      responseType: 'stream',
      maxRedirects: 5,
    });

    const originalName = item.jdFileOriginalName || item.jdFile || path.basename(new URL(item.jdFileUrl).pathname) || 'recruitment-file';
    const ext = path.extname(originalName).toLowerCase();
    const contentType = fileResponse.headers['content-type']
      || (ext === '.pdf' ? 'application/pdf' : 'application/octet-stream');

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `inline; filename="${originalName.replace(/"/g, '')}"`);
    res.setHeader('Cache-Control', 'private, max-age=300');
    fileResponse.data.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Unable to load recruitment file',
    });
  }
};

export const deleteRecruitment = async (req, res) => {
  try {
    await Recruitment.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Recruitment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInternships = async (req, res) => {
  try {
    const data = await InternshipApplication.find().sort({ createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateInternship = async (req, res) => {
  try {
    const application = await InternshipApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({ success: false, message: 'Internship application not found' });
    }

    if (req.body.interviewStatus) {
      const allowed = ['not_required', 'pending', 'cleared', 'rejected'];
      if (!allowed.includes(req.body.interviewStatus)) {
        return res.status(400).json({ success: false, message: 'Invalid interview status' });
      }

      application.interviewStatus = req.body.interviewStatus;

      if (application.planType === 'talent_free_review') {
        if (req.body.interviewStatus === 'cleared') application.status = 'interview_cleared';
        if (req.body.interviewStatus === 'rejected') application.status = 'interview_rejected';
        if (req.body.interviewStatus === 'pending') application.status = 'interview_pending';
      }
    }

    if (req.body.status) {
      application.status = req.body.status;
    }

    await application.save();
    res.json({ success: true, data: application });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteInternship = async (req, res) => {
  try {
    await InternshipApplication.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Internship application deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getInternshipDomains = async (req, res) => {
  try {
    const data = await InternshipDomain.find().sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createInternshipDomain = async (req, res) => {
  try {
    const item = new InternshipDomain(req.body);
    await item.save();
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const updateInternshipDomain = async (req, res) => {
  try {
    const item = await InternshipDomain.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after', runValidators: true });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteInternshipDomain = async (req, res) => {
  try {
    await InternshipDomain.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Internship domain deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
