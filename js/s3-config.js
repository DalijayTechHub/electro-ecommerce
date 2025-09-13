// S3 Configuration for Image Storage
const s3Config = {
    bucketName: 'electro-ecommerce-imgs',
    region: 'us-east-1',
    baseUrl: 'https://electro-ecommerce-imgs.s3.us-east-1.amazonaws.com/'
};

// Update image paths to use S3
function getS3ImageUrl(imagePath) {
    // Remove 'img/' prefix if present
    const cleanPath = imagePath.replace('img/', '');
    return s3Config.baseUrl + cleanPath;
}

// Export for use in other files
window.s3Config = s3Config;
window.getS3ImageUrl = getS3ImageUrl;