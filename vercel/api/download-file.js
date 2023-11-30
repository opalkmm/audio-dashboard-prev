import AWS from "aws-sdk";

/*
 * Download file from S3 bucket
 * Secret keys are stored in .env file
 */

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

export default async function (req, res) {
  const { path, filename } = req.body;
  const s3 = new AWS.S3();
  const bucketName = process.env.REACT_APP_AWS_S3_BUCKET_NAME || "";
  const params = {
    Bucket: bucketName,
    Key: `${path}/${filename}`,
  };
  const response = await s3.getObject(params).promise();
  return res.send(response);
}
