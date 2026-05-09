const TelegramBot = require('node-telegram-bot-api');

// BotFather'dan olingan API tokenni shu yerga kiritasiz
const token = '8674436820:AAE3qClPc0S13w3BRIQnhtlImOo_lZ0NDMs';

// Botni 'polling' usulida ishga tushirish
const bot = new TelegramBot(token, {polling: true});

// Foydalanuvchi /start bosganda ishlaydigan funksiya
bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;
  const ism = msg.from.first_name;

  // Botning javob xabari
  bot.sendMessage(chatId, `Salom, ${ism}! Botimizga xush kelibsiz. Men yordam berishga tayyorman!`);
});

// Bot kanalda admin qilinganda xatolik bermasligi va ishlashi uchun oddiy xabar ushlagich
bot.on('channel_post', (msg) => {
  // Bu yerda bot kanalga tashlangan xabarlarni o'qiydi.
  // Hech qanday "leaveChat" (chiqib ketish) buyrug'i yo'qligi sababli, bot kanalda qolaveradi.
  console.log('Kanalga yangi xabar joylandi:', msg.text);
});

console.log('Bot muvaffaqiyatli ishga tushdi...');
