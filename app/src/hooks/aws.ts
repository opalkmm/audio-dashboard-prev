import AWS from 'aws-sdk';

/*
 * Creates hooks for AWS S3
 * List files in bucket, upload files to bucket, download files from bucket
 * Secret keys are stored in .env file
 */

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION
});

export const useAWS = () => {
  // list files in bucket
  const listFiles = ({ folder }: { folder: string | undefined }) => {
    const s3 = new AWS.S3();
    const bucketName = process.env.REACT_APP_AWS_S3_BUCKET_NAME || '';
    const params = {
      Bucket: bucketName
    };
    return s3
      .listObjects(folder ? { ...params, Prefix: `${folder}/` } : params)
      .promise();
  };

  // upload file to bucket
  const uploadFiles = ({ file, path }: { file: File; path: string }) => {
    const params = {
      Bucket: process.env.REACT_APP_AWS_S3_BUCKET_NAME || '',
      Key: `${path}/${file.name}`,
      ContentType: file.type,
      Body: file,
      ACL: 'public-read'
    };

    const s3 = new AWS.S3();
    return s3.upload(params).promise();
  };

  // download from bucket
  const downloadFiles = ({ path }: { path: string }) => {
    const s3 = new AWS.S3();
    const bucketName = process.env.REACT_APP_AWS_S3_BUCKET_NAME || '';
    const params = {
      Bucket: bucketName,
      Key: path
    };
    return s3.getObject(params).promise();
  };
  return { listFiles, uploadFiles, downloadFiles };
};
