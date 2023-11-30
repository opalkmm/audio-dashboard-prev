import AWS from "aws-sdk";

/*
 * upload files to S3 bucket
 * Secret keys are stored in .env file
 */

AWS.config.update({
  accessKeyId: process.env.REACT_APP_AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_AWS_SECRET_ACCESS_KEY,
  region: process.env.REACT_APP_AWS_REGION,
});

export default async function (req, res) {
  const { file, path } = req.body;
  const params = {
    Bucket: process.env.REAC_APP_AWS_S3_BUCKET_NAME || "",
    Key: `${path}/${file.name}`,
    ContentType: file.type,
    Body: file,
    ACL: "public-read",
  };

  const s3 = new AWS.S3();
  const response = await s3.upload(params).promise();
  res.send(response);
}
