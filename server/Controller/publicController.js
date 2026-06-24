import Placement from '../models/Placement.js';
import axios from 'axios';
import path from 'path';
import Course from '../models/Course.js';
import Testimonial from '../models/Testimonial.js';
import HiringDrive from '../models/HiringDrive.js';
import SiteStat from '../models/SiteStat.js';
import Partner from '../models/Partner.js';
import Resource from '../models/Resource.js';

const cleanEnv = (value) => String(value || '').trim().replace(/^"|"$/g, '');

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

export const getPublicPlacements = async (req, res) => {
  try {
    const data = await Placement.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicCourses = async (req, res) => {
  try {
    const data = await Course.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicTestimonials = async (req, res) => {
  try {
    const data = await Testimonial.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicHiringDrives = async (req, res) => {
  try {
    const data = await HiringDrive.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicStats = async (req, res) => {
  try {
    const data = await SiteStat.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicPartners = async (req, res) => {
  try {
    const data = await Partner.find({ isActive: true }).sort({ order: 1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPublicResources = async (req, res) => {
  try {
    const data = await Resource.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const viewPublicResourceFile = async (req, res) => {
  try {
    const item = await Resource.findOne({ _id: req.params.id, isActive: true }).lean();
    if (!item) {
      return res.status(404).json({ success: false, message: 'Resource not found' });
    }

    if (item.fileStorageProvider === 'supabase' && item.fileStoragePath) {
      const { url, serviceRoleKey, bucket } = getSupabaseResourceStorageConfig();
      const fileResponse = await axios.get(
        `${url}/storage/v1/object/${bucket}/${item.fileStoragePath}`,
        {
          responseType: 'stream',
          headers: {
            apikey: serviceRoleKey,
            Authorization: `Bearer ${serviceRoleKey}`,
          },
        }
      );

      const originalName = item.fileOriginalName || item.fileName || path.basename(item.fileStoragePath) || 'resource-file';
      const ext = path.extname(originalName).toLowerCase();
      const contentType = fileResponse.headers['content-type']
        || (ext === '.pdf' ? 'application/pdf' : 'application/octet-stream');

      res.setHeader('Content-Type', contentType);
      res.setHeader('Content-Disposition', `inline; filename="${originalName.replace(/"/g, '')}"`);
      res.setHeader('Cache-Control', 'public, max-age=300');
      return fileResponse.data.pipe(res);
    }

    if (item.fileName) {
      return res.redirect(`/api/uploads/${encodeURIComponent(item.fileName)}`);
    }

    return res.status(404).json({ success: false, message: 'No file attached to this resource' });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.response?.data?.message || error.message || 'Unable to load resource file',
    });
  }
};
