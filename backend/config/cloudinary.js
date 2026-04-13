const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('CRITICAL ERROR: Cloudinary credentials are missing in .env file!');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'chat_app_media',
    resource_type: 'auto', // Important for videos and documents
    allowed_formats: ['jpg', 'png', 'jpeg', 'gif', 'mp4', 'webm', 'pdf', 'doc', 'docx', 'txt', 'xlsx', 'pptx'],
  },
});

module.exports = { cloudinary, storage };
