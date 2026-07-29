import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// §12.4: never touches local disk — streams the multer memory buffer
// straight to Cloudinary. Shared by avatar uploads (200x200 face-cropped)
// and admin-uploaded destination images (no forced crop).
export function uploadImage(buffer, options) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(options, (err, result) => {
      if (err) reject(err);
      else resolve(result);
    });
    stream.end(buffer);
  });
}

export function destroyImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}
