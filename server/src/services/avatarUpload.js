import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// §12.4: never touches local disk — streams the multer memory buffer
// straight to Cloudinary. Transformed at upload time (200x200 face-cropped)
// rather than resizing in code.
export function uploadAvatarImage(buffer) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: 'expeditor/avatars',
        transformation: [{ width: 200, height: 200, crop: 'fill', gravity: 'face' }],
      },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
    stream.end(buffer);
  });
}

export function destroyAvatarImage(publicId) {
  return cloudinary.uploader.destroy(publicId);
}
