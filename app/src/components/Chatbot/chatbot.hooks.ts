import { useAWS } from 'hooks/aws';
import { useEffect, useState } from 'react';
import { useDashboard } from 'store/dashboard';

export type ChatMessageType = {
  message: string;
  sender: 'user' | 'bot';
  image?: string;
  timestamp: string;
};
export const welcomeChat = {
  message: "Hello, I'm a chatbot. How can I help you?",
  sender: 'bot',
  timestamp: `${new Date().toString()}`
} as ChatMessageType;

export const useChatbot = ({
  chatHistory
}: {
  chatHistory: ChatMessageType[] | undefined;
}) => {
  const { user } = useDashboard();
  const { uploadFiles, downloadFiles } = useAWS();
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [chatHistoryS3, setChatHistory] = useState<ChatMessageType[]>([]);

  useEffect(() => {
    if (!historyLoaded) return;
    if (!chatHistory) return;
    //  create file from chat history
    const file = new File([JSON.stringify(chatHistory)], 'chat.json', {
      type: 'application/json'
    });
    // upload file to s3
    if (user?.email !== '' && user?.name !== '') {
      uploadFiles({ file, path: user?.email });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyLoaded, chatHistory]);

  useEffect(() => {
    // download chat history from s3
    if (user?.email !== '' && user?.name !== '') {
      downloadFiles({ path: `${user.email}/chat.json` })
        .then((data) => {
          if (data && data.Body) {
            try {
              const chat = JSON.parse(
                data.Body.toString()
              ) as ChatMessageType[];
              setChatHistory(chat && chat.length > 0 ? chat : [welcomeChat]);
            } catch (error) {
              // Set welcome message
              setChatHistory([welcomeChat]);
            }
          }
          setHistoryLoaded(true);
        })
        .catch(() => {
          // Set welcome message
          setChatHistory([welcomeChat]);
          setHistoryLoaded(true);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return { historyLoaded, chatHistoryS3 };
};
