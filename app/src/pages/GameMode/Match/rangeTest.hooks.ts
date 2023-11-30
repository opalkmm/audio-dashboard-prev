import { useAWS } from 'hooks/aws';
import { useCallback, useEffect, useState } from 'react';
import { useDashboard } from 'store/dashboard';

export type RangeTestType = {
  lowRange: string;
  highRange: string;
  timestamp: string;
};

export const useRangeTest = ({
  rangeTestHistory
}: {
  rangeTestHistory: RangeTestType[] | undefined;
}) => {
  const { user } = useDashboard();
  const { uploadFiles, downloadFiles } = useAWS();
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [rangeTestHistoryS3, setRangeTestHistory] = useState<RangeTestType[]>(
    []
  );

  useEffect(() => {
    if (!historyLoaded) {
      downloadRangeTestHistory().then((data) => {
        // console.log(data);
        setRangeTestHistory(data || []);
      });
    }
    if (!rangeTestHistory || rangeTestHistory.length === 0) return;
    //  create file from range history
    const file = new File(
      [JSON.stringify(rangeTestHistory)],
      'vocal-range.json',
      {
        type: 'application/json'
      }
    );
    // upload file to s3
    if (user?.email !== '' && user?.name !== '') {
      uploadFiles({ file, path: user?.email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyLoaded, rangeTestHistory]);

  const downloadRangeTestHistory = useCallback(async () => {
    // download range history from s3
    let loadedRanges = new Array<RangeTestType>();
    if (user?.email === '' || user?.name === '') {
      return loadedRanges;
    }
    try {
      const data = await downloadFiles({
        path: `${user.email}/vocal-range.json`
      });
      if (data?.Body) {
        try {
          const range = JSON.parse(data.Body.toString()) as RangeTestType[];
          loadedRanges = range && range.length > 0 ? range : [];
        } catch (error) {
          // Set initial values
          console.log(error);
          setRangeTestHistory([]);
        }
      }
    } finally {
      setHistoryLoaded(true);
      return loadedRanges;
    }
  }, [downloadFiles, user.email, user?.name]);

  return { historyLoaded, rangeTestHistoryS3, downloadRangeTestHistory };
};
