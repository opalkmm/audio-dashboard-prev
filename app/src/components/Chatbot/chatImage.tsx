import { useEffect, useState } from 'react';
import { ImageListItem } from '@mui/material';
import { useAWS } from 'hooks/aws';

export const ChatImage: React.FC<{ s3Path: string }> = ({ s3Path }) => {
  const { downloadFiles } = useAWS();
  const [blobUrl, setBlobUrl] = useState<string>();

  useEffect(() => {
    const getImage = async () => {
      try {
        const image = await downloadFiles({
          path: s3Path.replace(
            `s3://${process.env.REACT_APP_AWS_S3_BUCKET_NAME}/`,
            ''
          )
        });
        const blob = new Blob([image.Body as Uint8Array], {
          type: image.ContentType
        });
        const blobUrl = URL.createObjectURL(blob);
        setBlobUrl(blobUrl);
      } catch (error) {
        console.log(error);
      }
    };
    getImage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s3Path]);

  return (
    <ImageListItem sx={{ maxWidth: 300 }}>
      <img src={blobUrl} alt="chat" />
    </ImageListItem>
  );
};
