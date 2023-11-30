import { useEffect, useState } from 'react';
import { useAWS } from 'hooks/aws';
import { useDashboard } from 'store/dashboard';
import { AUDIO_RECORDING_FOLDER } from 'config';

export type archive = {
  id: string;
  path: string;
  analysisPath?: string;
  created_at: string;
  isPlaying: boolean;
  blobUrl?: string;
  isLoading?: boolean;
};

export const useGetArchives = () => {
  const { listFiles } = useAWS();
  const [archives, setArchives] = useState<archive[]>([]);
  const { user, refresh } = useDashboard();

  useEffect(() => {
    const getArchives = async () => {
      try {
        const archives = await listFiles({
          folder: `${user.email}/${AUDIO_RECORDING_FOLDER}`
        });

        if (archives && archives.Contents && archives.Contents.length > 0) {
          const contents = archives.Contents;

          // create a list of archives where the name and created_at are extracted from the key and are not undefined
          const archivesList = contents
            .map((archive) => {
              const key = archive.Key;
              const path = key?.split(`/${AUDIO_RECORDING_FOLDER}/`)[1];
              const id = path?.split('/')[0];
              const created_at = archive.LastModified?.toLocaleDateString(
                'en-US',
                {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                }
              );
              if (path && created_at) {
                return {
                  id,
                  path,
                  created_at
                };
              }
              return undefined;
            })
            .filter(
              (archive) =>
                archive !== undefined && archive.path.includes('.wav')
            ) as archive[];
          setArchives(archivesList.reverse());
        }
      } catch (error) {
        console.log(error);
      }
    };
    getArchives();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, refresh]);

  //   const handlePlayRecording = async (path: string, isPlaying: boolean) => {
  //     if (isPlaying) {
  //       setArchives((prev) => {
  //         const updated = prev.find((a) => a.path === path);
  //         if (updated) {
  //           updated.isPlaying = false;
  //         }
  //         return [...prev];
  //       });
  //       return;
  //     }
  //     // set isPlaying state to false for all archives
  //     setArchives((prev) => {
  //       const updated = prev.map((a) => {
  //         a.isPlaying = false;
  //         return a;
  //       });
  //       return [...updated];
  //     });

  //     // set the isLoading state to true for the archive that is being played
  //     setArchives((prev) => {
  //       const updated = prev.find((a) => a.path === path);
  //       if (updated) {
  //         updated.isLoading = true;
  //       }
  //       return [...prev];
  //     });

  //     // download the file from s3
  //     try {
  //       const file = await downloadFiles({
  //         path: `${user.email}/${AUDIO_RECORDING_FOLDER}/${path}`
  //       });

  //       // create a blob url from the file
  //       const blobUrl = URL.createObjectURL(
  //         new Blob([file.Body as Uint8Array], { type: file.ContentType })
  //       );

  //       // set the isPlaying state to true for the archive that is being played
  //       setArchives((prev) => {
  //         const updated = prev.find((a) => a.path === path);
  //         if (updated) {
  //           updated.isPlaying = true;
  //           updated.blobUrl = blobUrl;
  //         }
  //         return [...prev];
  //       });
  //     } catch (error) {
  //       dispatch(
  //         setSnackbar({ message: (error as AWSError).message, variant: 'error' })
  //       );
  //     } finally {
  //       // set the isLoading state to false for the archive that is being played
  //       setArchives((prev) => {
  //         const updated = prev.find((a) => a.path === path);
  //         if (updated) {
  //           updated.isLoading = false;
  //         }
  //         return [...prev];
  //       });
  //     }
  //   };

  return { archives };
};
