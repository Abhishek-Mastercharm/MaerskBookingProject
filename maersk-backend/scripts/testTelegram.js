import 'dotenv/config';
import { sendShipmentUpdateAlert } from '../src/services/telegramService.js';

// Dummy data resembling the user's example
const dummyShipmentData = {
  invoice: '64/26-27',
  booking: '272101490',
  shippingLine: 'MAERSK',
  vessel: 'MAERSK FLORENCE',
  voyage: '628W',
  status: 'EST → ACT',
  loadingPort: 'Mundra',
  destination: 'Tema',
  eta: '09-Aug-2026',
  updated: '19-Jul-2026'
};

const runTest = async () => {
  console.log('Testing Telegram Bot Notification...');
  console.log('Token check:', process.env.TELEGRAM_BOT_TOKEN ? 'Set' : 'Missing');
  console.log('Chat ID check:', process.env.TELEGRAM_CHAT_ID ? 'Set' : 'Missing');
  
  if (!process.env.TELEGRAM_BOT_TOKEN || !process.env.TELEGRAM_CHAT_ID) {
    console.log('\nPlease make sure you have added both TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID to your .env file in the maersk-backend directory.');
    return;
  }

  await sendShipmentUpdateAlert(dummyShipmentData);
};

runTest();
