import { SetStateAction, useEffect, useRef, useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  Menu,
  MenuItem
} from '@mui/material';
import MinimizeIcon from '@mui/icons-material/Minimize';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { COLORS } from 'theme';
import {
  Container,
  ChatStyles,
  Wrapper,
  ChatHeader,
  ChatBody,
  ChatMessageContainer,
  minimizedWidth,
  headerHeight,
  expandedWidth,
  totalHeight,
  ChatbotFab
} from './styles';
import { motion } from 'framer-motion';
import { ChatMessageType, useChatbot, welcomeChat } from './chatbot.hooks';
import { useSendChatMutation } from 'store/dashboardApi';
import { ChatResponseType } from 'types/dashboard';
import { ChatImage } from './chatImage';
import { ChatBubble } from '@mui/icons-material';
import type { FabProps } from '@mui/material/Fab';

const ChatBox = () => {
  const [sendChat] = useSendChatMutation();
  const [isMinimized, setIsMinimized] = useState(true);
  const [minimizedComplete, setMinimizedComplete] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessageType[]>();
  const { chatHistoryS3, historyLoaded } = useChatbot({
    chatHistory
  });

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // set welcome chat message on chat window open
  useEffect(() => {
    if (isMinimized) return;
    if (chatHistory?.length === 0) {
      setChatHistory([welcomeChat]);
    }
  }, [chatHistory, isMinimized]);

  // set chat history from s3
  useEffect(() => {
    if (historyLoaded) {
      setChatHistory(chatHistoryS3);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [historyLoaded]);

  const handleSubmit = (event: { preventDefault: () => void }) => {
    event.preventDefault();
    if (message && chatHistory) {
      // chat history update

      // add user chat to chat history
      setChatHistory([
        ...chatHistory,
        { message, sender: 'user', timestamp: `${new Date().toString()}` }
      ]);
      setMessage('');

      // send chat to api
      sendChat({ message })
        .unwrap()
        .then((res: ChatResponseType) => {
          const { message, image } = res;
          console.log('res', res);
          setChatHistory((prev) => [
            ...(prev || []),
            {
              message,
              sender: 'bot',
              timestamp: `${new Date().toString()}`,
              image
            }
          ]);
        });
    }
  };

  // ref chat message container
  const chatMessageContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // scroll to bottom of chat message container
    chatMessageContainerRef.current?.scrollTo({
      top: chatMessageContainerRef.current?.scrollHeight,
      behavior: 'smooth'
    });
  }, [chatHistory]);

  const handleChange = (event: {
    target: { value: SetStateAction<string> };
  }) => {
    setMessage(event.target.value);
  };

  // more menu open
  const handleOpenMoreMenu = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  // more menu close
  const handleCloseMoreMenu = () => {
    setAnchorEl(null);
  };

  // clear chat history
  const handleClearChatHistory = () => {
    setChatHistory([]);
    handleCloseMoreMenu();
    setIsMinimized(true);
  };

  const handleChatbotIcon: FabProps['onClick'] = () => {
    setIsMinimized(false);
  };

  return (
    <Wrapper
      initial={{ height: headerHeight, width: minimizedWidth }}
      animate={{
        height: isMinimized ? headerHeight : totalHeight,
        width: isMinimized ? minimizedWidth : expandedWidth
      }}
      transition={{ duration: 0.3, ease: 'circOut' }}
      onAnimationComplete={() => setMinimizedComplete(!minimizedComplete)}
      className={isMinimized === true ? 'marginIcon' : undefined}
    >
      {isMinimized === true ? (
        <ChatbotFab onClick={handleChatbotIcon}>
          <ChatBubble fontSize="medium" />
        </ChatbotFab>
      ) : (
        <Container elevation={20}>
          <ChatHeader
            id="chatbot-header"
            className={isMinimized ? 'minimized' : 'expanded'}
            onClick={() => isMinimized && setIsMinimized(false)}
          >
            <Typography variant="h6">Chatbot</Typography>
            {!isMinimized && (
              <Stack direction={'row'} spacing={0}>
                <Button
                  sx={{ minWidth: '15px' }}
                  onClick={() => setIsMinimized(true)}
                >
                  <MinimizeIcon
                    fontSize="medium"
                    sx={{
                      color: COLORS.highlightLighter,
                      transform: 'translate(0px, -8px)'
                    }}
                  />
                </Button>
                <Button sx={{ minWidth: '15px' }} onClick={handleOpenMoreMenu}>
                  <MoreHorizIcon
                    fontSize="medium"
                    sx={{
                      color: COLORS.highlightLighter
                    }}
                  />
                </Button>
                <Menu
                  sx={{ zIndex: 1400 }}
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleCloseMoreMenu}
                  MenuListProps={{
                    'aria-labelledby': 'basic-button'
                  }}
                >
                  <MenuItem onClick={handleClearChatHistory}>
                    Clear Chat
                  </MenuItem>
                </Menu>
              </Stack>
            )}
          </ChatHeader>

          <ChatBody
            id="chatbot-body"
            className={isMinimized ? 'minimized' : 'expanded'}
          >
            <ChatMessageContainer
              ref={chatMessageContainerRef}
              id="chatbot-message-container"
            >
              {chatHistory?.map((chat, index) => (
                <motion.div
                  id="chatbot-message"
                  style={{ display: 'flex', flexDirection: 'column' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: minimizedComplete ? 0 : 1 }}
                  transition={{ delay: 0.05 * index, duration: 0.4 }}
                  key={index}
                >
                  <Box sx={ChatStyles[chat.sender]}>
                    <Typography>{chat.message}</Typography>
                  </Box>
                  {chat.image && (
                    <Box sx={ChatStyles[chat.sender]}>
                      <ChatImage s3Path={chat.image} />
                    </Box>
                  )}
                </motion.div>
              ))}
            </ChatMessageContainer>
          </ChatBody>
          <form
            onSubmit={handleSubmit}
            style={{ width: '100%', padding: '0px 16px 10px 16px' }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }} width={'100%'}>
              <TextField
                value={message}
                onChange={handleChange}
                variant="outlined"
                sx={{ mr: 2 }}
                placeholder="Message"
                fullWidth
              />
              <Button type="submit" variant="contained">
                Send
              </Button>
            </Box>
          </form>
        </Container>
      )}
    </Wrapper>
  );
};

export default ChatBox;
