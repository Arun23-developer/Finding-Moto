import { v2 as cloudinary } from 'cloudinary';
import config from '../config';

const isConfigured = Boolean(
  config.cloudinaryCloudName && config.cloudinaryApiKey && config.cloudinaryApiSecret
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: config.cloudinaryCloudName,
    api_key: config.cloudinaryApiKey,
    api_secret: config.cloudinaryApiSecret,
    secure: true,
  });
}

export const uploadImageBuffer = (
  buffer: Buffer,
  folder: string
): Promise<string> => {
  if (!isConfigured) {
    return Promise.reject(new Error('Cloudinary is not configured'));
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
        transformation: [{ fetch_format: 'auto', quality: 'auto' }],
      },
      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        const secureUrl = result?.secure_url;
        if (!secureUrl) {
          reject(new Error('Cloudinary upload did not return a secure URL'));
          return;
        }

        resolve(secureUrl);
      }
    );

    uploadStream.end(buffer);
  });
};