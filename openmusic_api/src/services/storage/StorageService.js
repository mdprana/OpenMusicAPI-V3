const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const config = require('../../utils/config');

class StorageService {
  constructor() {
    this._S3 = new AWS.S3({
      accessKeyId: config.s3.accessKeyId,
      secretAccessKey: config.s3.secretAccessKey,
      region: config.s3.region,
    });
  }

  writeFile(file, meta) {
    const filename = +new Date() + meta.filename;
    const uploadPath = path.resolve(__dirname, '../../../uploads', filename);

    // Ensure upload directory exists
    const uploadDir = path.dirname(uploadPath);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileStream = fs.createWriteStream(uploadPath);

    return new Promise((resolve, reject) => {
      fileStream.on('error', (error) => reject(error));
      file.pipe(fileStream);
      file.on('end', () => resolve(filename));
    });
  }

  async uploadToS3(file, meta) {
    const parameter = {
      Bucket: config.s3.bucketName,
      Key: +new Date() + meta.filename,
      Body: file._data,
      ContentType: meta.headers['content-type'],
    };

    const result = await this._S3.upload(parameter).promise();
    return result.Location;
  }

  async deleteFromS3(key) {
    const parameter = {
      Bucket: config.s3.bucketName,
      Key: key,
    };

    await this._S3.deleteObject(parameter).promise();
  }

  generateFileUrl(filename) {
    if (config.s3.bucketName) {
      return `https://${config.s3.bucketName}.s3.${config.s3.region}.amazonaws.com/${filename}`;
    }
    return `http://${config.app.host}:${config.app.port}/uploads/${filename}`;
  }
}

module.exports = StorageService;
