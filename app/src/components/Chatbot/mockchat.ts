import { ChatMessageType } from './chatbot.hooks';

export const mockChatData = [
  {
    message: "Hello, I'm a chatbot. How can I help you?",
    sender: 'bot',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: 'I need help with my account',
    sender: 'user',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: 'What is your account number?',
    sender: 'bot',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: '123456789',
    sender: 'user',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: 'What is your date of birth?',
    sender: 'bot',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: '01/01/2000',
    sender: 'user',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: 'What is your mother’s maiden name?',
    sender: 'bot',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: 'Smith',
    sender: 'user',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: 'What is your favourite colour?',
    sender: 'bot',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: 'Blue',
    sender: 'user',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: 'Thank you. Your account has been unlocked.',
    sender: 'bot',
    timestamp: '2021-03-01T12:00:00.000Z'
  },
  {
    message: 'Thank you',
    sender: 'user',
    timestamp: '2021-03-01T12:00:00.000Z'
  }
] as ChatMessageType[];
