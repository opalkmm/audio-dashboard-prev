import { useEffect, useState } from 'react';
import { useAWS } from 'hooks/aws';
import { useDashboard } from 'store/dashboard';
import { PromiseResult } from 'aws-sdk/lib/request';
import { AWSError, S3 } from 'aws-sdk';

export type PaymentRecord = {
  paymentAmount: number;
  user: string;
  email: string;
  paymentEmail: string;
  paymentIntent: string | null;
  freePlaysRemaining: number;
  timestamp: string;
};

export const useUpdateUserPaymentRecord = () => {
  const { user } = useDashboard();
  const { uploadFiles, downloadFiles } = useAWS();
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const uploadPaymentHistory = async (paymentHistory: PaymentRecord | undefined) => {
    if (!historyLoaded || !paymentHistory) return;

    // Create a file from paymentHistory
    const file = new File(
      [JSON.stringify(paymentHistory)],
      'paymentHistory.json',
      {
        type: 'application/json'
      }
    );

    // Upload the file to S3
    if (user?.email !== '' && user?.name !== '') {
      return await uploadFiles({ file, path: user?.email });
    }

  };

  const getPaymentFile = async () => {
    const promises = new Array<Promise<PromiseResult<S3.GetObjectOutput, AWSError>>>();
      promises.push(
        downloadFiles({ path: `${user.email}/paymentHistory.json` })
      );

      // wait for all promises to resolve
      return Promise.all(promises);
  };

  const createNewRecord = async () => {
    const createPromises = new Array<Promise<S3.ManagedUpload.SendData | undefined>>();
    let blank = {
        paymentAmount: 0,
        user: user.name,
        email: user.email,
        paymentEmail: user.email,
        paymentIntent: null,
        freePlaysRemaining: 50,
        timestamp: new Date().toString()
      } as PaymentRecord;
    ;
    createPromises.push(
        uploadPaymentHistory(blank)
      );

      // wait for all promises to resolve
      return Promise.all(createPromises);
  };

  const downloadPaymentHistory = async () => {
    if (user?.email === '' || user?.name === '') {
      setHistoryLoaded(true);
      return;
    }

    // Download payment history from S3
    try {
      const file = await getPaymentFile().then(res => res);
      // TODO Return the file, read the most recent payment datat object,
      // return that to client

      const parsedData = await file.map((item) => {
        item.LastModified = new Date(item?.LastModified as Date);
        return item;
      });
      
      // Find the object with the most recent LastModified date
      const mostRecentObject = parsedData.reduce((prev, current) => {
        if (!prev || !current) {
          return prev || current;
        }
        return prev.LastModified && current.LastModified && prev.LastModified > current.LastModified ? prev : current;
      });
      
      setHistoryLoaded(true);
      const parseDataObject = JSON.parse(mostRecentObject?.Body?.toString('utf-8') as string) as PaymentRecord;
      
      return parseDataObject;
      
    } catch (error) {
    const awsError = error as AWSError;
      // the file doesn't exist yet, let's create one and update it
      console.log('ERROR FETCH PAYMENTHISTORY');
      console.log(error);
      if (awsError.statusCode === 404) {
          // Catching NoSuchKey
          console.log('NO FILE YET');
          createNewRecord();
          setHistoryLoaded(true);
        } else {
            // Handle other errors here.
            console.error('An error occurred:', awsError.message);
          }
      
    }
  };

  useEffect(() => {
    downloadPaymentHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { historyLoaded, uploadPaymentHistory, downloadPaymentHistory };
};
