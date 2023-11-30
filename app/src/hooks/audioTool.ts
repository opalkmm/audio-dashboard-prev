import { useState, useEffect } from 'react';
import { useAWS } from './aws';
import { AWSError, S3 } from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';

/*
    This hook downloads an audio files and the .rtf file from S3 bucket and returns them
*/

// supported audio types
const audioTypes = ['.mp3', '.wav'];

// error type
type AudioToolErrorType = {
  message: string;
  variant: 'error' | 'warning';
};

export const useAudioTool = (path: string) => {
  const { listFiles, downloadFiles } = useAWS();
  const [files, setFiles] = useState<S3.GetObjectOutput[]>();
  const [error, setError] = useState<AudioToolErrorType | null>(null);

  // console.log('useAudioTool', files, path);

  const getList = async () => {
    return listFiles({ folder: path });
  };

  const getFiles = async (Contents: S3.ObjectList) => {
    // get audio file paths
    const audioPaths = Contents.filter(({ Key }) =>
      audioTypes.some((type) => Key?.toLocaleLowerCase().includes(type))
    );

    const promises = new Array<
      Promise<PromiseResult<S3.GetObjectOutput, AWSError>>
    >();

    audioPaths.forEach((audioPath) => {
      const { Key } = audioPath;
      if (Key) {
        promises.push(downloadFiles({ path: Key }));
      }
    });

    // get txt file paths
    const rtfPaths = Contents.filter((content) =>
      content.Key?.includes('.txt')
    )[0];

    promises.push(downloadFiles({ path: rtfPaths.Key || '' }));

    // wait for all promises to resolve
    return Promise.all(promises);
  };

  useEffect(() => {
    setError(null);
    const loadData = async () => {
      const { Contents } = await getList();
      if (Contents && Contents.length > 0) {
        const response = await getFiles(Contents);
        setFiles(response);
      } else {
        setError({
          message: `No files found at "${path}"`,
          variant: 'warning'
        });
      }
    };
    loadData();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return { files, error };
};
