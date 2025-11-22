const cloudinary = require('cloudinary').v2;
const streamifier = require('streamifier');

// ✅ Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

/**
 * Upload file lên Cloudinary
 * @param {Buffer} fileBuffer - Buffer của file từ multer
 * @param {string} folder - Folder trên Cloudinary (vd: 'products', 'avatars')
 * @returns {Promise<string>} - URL của ảnh đã upload
 */
async function uploadImage(fileBuffer, folder = 'products') {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: folder,
                resource_type: 'image',
                transformation: [
                    { width: 1000, height: 1000, crop: 'limit' },
                    { quality: 'auto' }
                ]
            },
            (error, result) => {
                if (error) {
                    console.error('Cloudinary upload error:', error);
                    return reject(error);
                }
                resolve(result.secure_url);
            }
        );

        streamifier.createReadStream(fileBuffer).pipe(uploadStream);
    });
}

/**
 * Upload nhiều ảnh
 * @param {Array<Buffer>} fileBuffers - Mảng buffer của các file
 * @param {string} folder - Folder trên Cloudinary
 * @returns {Promise<Array<string>>} - Mảng URL của các ảnh
 */
async function uploadMultipleImages(fileBuffers, folder = 'products') {
    const uploadPromises = fileBuffers.map(buffer => uploadImage(buffer, folder));
    return Promise.all(uploadPromises);
}

/**
 * Xóa ảnh từ Cloudinary
 * @param {string} imageUrl - URL của ảnh cần xóa
 * @returns {Promise<void>}
 */
async function deleteImage(imageUrl) {
    try {
        // Extract public_id từ URL
        // vd: https://res.cloudinary.com/demo/image/upload/v1234567890/products/abc.jpg
        // => public_id = products/abc
        const urlParts = imageUrl.split('/');
        const fileName = urlParts[urlParts.length - 1].split('.')[0];
        const folder = urlParts[urlParts.length - 2];
        const publicId = `${folder}/${fileName}`;

        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted image: ${publicId}`);
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        throw error;
    }
}

module.exports = {
    uploadImage,
    uploadMultipleImages,
    deleteImage
};