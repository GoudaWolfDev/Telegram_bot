const fs = require('fs');
const path = require('path');
const { Telegraf } = require('telegraf');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const Groq = require('groq-sdk');
const logger = require('./logger');

// مسار المجلد الحالي
const BASE_DIR = __dirname;

// دالة قراءة إعدادات ai_model.txt
function loadAIConfig() {
  const configPath = path.join(BASE_DIR, 'ai_model.txt');
  const raw = fs.readFileSync(configPath, 'utf-8');
  const config = {
    provider: 'gemini',
    gemini_model: 'gemini-1.5-flash',
    gemini_key: '',
    groq_model: 'llama-3.3-70b-versatile',
    groq_key: '',
    tts_url: 'https://godanasr-tts.hf.space',
    tts_voice: 'ar-EG-ShakirNeural'
  };

  raw.split('\n').forEach(line => {
    line = line.trim();
    if (!line || line.startsWith('#')) return;
    const eqIdx = line.indexOf('=');
    if (eqIdx !== -1) {
      const key = line.slice(0, eqIdx).trim();
      const val = line.slice(eqIdx + 1).trim();
      config[key] = val;
    }
  });

  return config;
}

// قراءة توكن البوت
function getBotToken() {
  const tokenPath = path.join(BASE_DIR, 'token_bot.txt');
  return fs.readFileSync(tokenPath, 'utf-8').trim();
}

// قراءة البرومبت
function getSystemPrompt() {
  const promptPath = path.join(BASE_DIR, 'ai-ader-sales_promt.md');
  return fs.readFileSync(promptPath, 'utf-8').trim();
}

// تخزين محادثات المستخدمين (Memory)
const userSessions = new Map();

function getUserHistory(userId) {
  if (!userSessions.has(userId)) {
    userSessions.set(userId, []);
  }
  return userSessions.get(userId);
}

function clearUserHistory(userId) {
  userSessions.delete(userId);
}

// تهيئة تليجرام
const botToken = getBotToken();
if (!botToken) {
  console.error('❌ خطأ: لم يتم العثور على توكن البوت في token_bot.txt');
  process.exit(1);
}

const bot = new Telegraf(botToken);
// دالة تنظيف النص تماماً من علامات التنسيق والنجوم
function cleanFormatting(text) {
  if (!text) return '';
  return text
    .replace(/[\*\#\_~`>]/g, '') // إزالة كل النجوم والشباك والماركداون
    .replace(/\n{3,}/g, '\n\n')  // إزالة الأسطر الفارغة الزائدة
    .trim();
}

// استدعاء Gemini
async function askGemini(userId, userMessage, config) {
  const apiKey = config.gemini_key;
  const modelName = config.gemini_model || 'gemini-1.5-flash';
  const currentPrompt = getSystemPrompt();

  if (!apiKey) {
    throw new Error('لم يتم تعيين gemini_key في ai_model.txt');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const history = getUserHistory(userId);

  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: currentPrompt
  });

  // تحويل الهستوري إلى تنسيق Gemini
  const chat = model.startChat({
    history: history.map(item => ({
      role: item.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: item.content }]
    }))
  });

  const result = await chat.sendMessage(userMessage);
  const rawReply = result.response.text();
  const reply = cleanFormatting(rawReply);

  // تحديث الهستوري
  history.push({ role: 'user', content: userMessage });
  history.push({ role: 'assistant', content: reply });

  // الحفاظ على آخر 10 رسائل
  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }

  return reply;
}

// استدعاء Groq
async function askGroq(userId, userMessage, config) {
  const apiKey = config.groq_key;
  const modelName = config.groq_model || 'llama-3.3-70b-versatile';
  const currentPrompt = getSystemPrompt();

  if (!apiKey || apiKey.includes('your_groq_api_key_here')) {
    throw new Error('يرجى وضع مفتاح Groq API صحيح في ai_model.txt عند اختيار provider=groq');
  }

  const groq = new Groq({ apiKey });
  const history = getUserHistory(userId);

  const messages = [
    { role: 'system', content: currentPrompt },
    ...history,
    { role: 'user', content: userMessage }
  ];

  const completion = await groq.chat.completions.create({
    messages,
    model: modelName
  });

  const rawReply = completion.choices[0]?.message?.content || 'عذراً، لم أتلق رداً من Groq.';
  const reply = cleanFormatting(rawReply);

  // تحديث الهستوري
  history.push({ role: 'user', content: userMessage });
  history.push({ role: 'assistant', content: reply });

  if (history.length > 10) {
    history.splice(0, history.length - 10);
  }

  return reply;
}

// تفريغ الرسائل الصوتية باستخدام Groq Whisper (whisper-large-v3)
async function transcribeAudioWithGroq(audioBuffer, fileName = 'audio.ogg') {
  const config = loadAIConfig();
  const apiKey = config.groq_key;

  if (!apiKey || apiKey.includes('your_groq_api_key_here')) {
    throw new Error('يرجى وضع مفتاح Groq API صالح في ai_model.txt لتفعيل تحويل الصوت.');
  }

  const groq = new Groq({ apiKey });

  // التأكد من أن صيغة الملف مدعومة لدى Whisper API
  let safeFileName = 'audio.ogg';
  if (fileName && /\.(mp3|mp4|mpeg|mpga|m4a|ogg|wav|webm|flac)$/i.test(fileName)) {
    safeFileName = fileName;
  }

  const file = await Groq.toFile(audioBuffer, safeFileName);

  const transcription = await groq.audio.transcriptions.create({
    file: file,
    model: 'whisper-large-v3',
    temperature: 0,
    response_format: 'verbose_json',
  });

  return transcription.text ? transcription.text.trim() : '';
}

// موجه الذكاء الاصطناعي الرئيسي
async function generateAIResponse(userId, text) {
  const config = loadAIConfig();
  const provider = (config.provider || 'gemini').toLowerCase();

  console.log(`🤖 معالجة طلب للمستخدم [${userId}] عبر مزود [${provider}]`);

  let reply = '';
  if (provider === 'groq') {
    reply = await askGroq(userId, text, config);
  } else {
    reply = await askGemini(userId, text, config);
  }

  return cleanFormatting(reply);
}

// أمر /start
bot.start((ctx) => {
  const welcome = `يا هلا بيك يا غالي! 👋 منورني\n` +
    `أنا مستشار مبيعات أَدِرْ الذكي 🚀\n\n` +
    `هنا عشان أساعدك تضاعف مبيعاتك وتوفر مصاريفك ونظبطلك متجرك بأعلى كفاءة 💰\n\n` +
    `تقدر تبعتلي رسايلك كتابة أو تسجل ريكورد بصوتك وهسمعك وأرد عليك فوراً 🎙️\n\n` +
    `قولي إيه مجال تجارتك أو شغال في إيه حالياً عشان أظبطلك الدنيا؟ 🤝`;
  ctx.reply(welcome);
});

// أمر /reset
bot.command('reset', (ctx) => {
  clearUserHistory(ctx.from.id);
  ctx.reply('تم مسح سجل المحادثة بنجاح! تفضل بطرح سؤالك كبداية جديدة.');
});

// أمر /status
bot.command('status', (ctx) => {
  const config = loadAIConfig();
  const msg = `حالة النظام الحالي:\n\n` +
    `• المزود النشط للمحادثة: ${config.provider}\n` +
    `• موديل المحادثة: ${config.provider === 'groq' ? config.groq_model : config.gemini_model}\n` +
    `• تحويل الصوت إلى نص: Groq Whisper (whisper-large-v3) 🎙️\n\n` +
    `يمكنك التبديل بين gemini و groq في أي وقت بتعديل ملف ai_model.txt مباشرة.`;
  ctx.reply(msg);
});

// ذاكرة المستخدمين الذين يفضلون الردود الصوتية (مثل من لا يعرف القراءة أو طلب فويس)
const userPrefersVoice = new Set();

// دالة توحيد الحروف العربية لدقة المطابقة
function normalizeArabic(text) {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/[\u064B-\u065F]/g, '');
}

// التحقق مما إذا كان العميل يطلب صراحة إيقاف الصوت والعودة للنص فقط
function shouldDisableVoice(text) {
  if (!text) return false;
  const norm = normalizeArabic(text);
  return /(بلاش\s*(صوت|فويس|ريكورد)|متتكلمش|مش\s*عايز\s*(صوت|فويس|ريكورد)|كتابه\s*بس|نص\s*بس|رد\s*كتابه|اكتب\s*كتابه)/.test(norm);
}

// التحقق مما إذا كان النص يطلب رداً صوتياً
function shouldReplyWithVoice(text) {
  if (!text) return false;
  const norm = normalizeArabic(text);

  // إذا طلب صراحة الكتابة فقط
  if (shouldDisableVoice(text)) return false;

  // 1. وجود كلمات تدل مباشرة على الصوت أو الريكورد أو الفويس
  const hasVoiceWord = /(صوت|فويس|ريكورد|تسجيل)/.test(norm);

  // 2. صعوبة القراءة بمختلف اللهجات العامية (أقرأ، أجري، أمي، إلخ)
  const hasReadingIssue = /(مبعرفش|مش\s*بعرف|ما\s*بعرف|معرفش|صعب|امي|مش\s*فاضي|مش\s*عايز|مش\s*حابب).*(اقرا|اجرى|اجرا|قرايه|قراءه)/.test(norm) || /مبعرفش\s*(اقرا|اجرى)/.test(norm);

  // 3. أفعال التحدث والسماع
  const hasSpeakingVerb = /(اتكلم|تكلم|كلمنا|كلمني|\bكلم\b|احكي|احكيلي|سمعني|اسمع|سامع)/.test(norm);

  return hasVoiceWord || hasReadingIssue || hasSpeakingVerb;
}

// توليد ملف صوتي من النص عبر Edge TTS (صوت شاكر المصري ar-EG-ShakirNeural)
async function generateSpeechAudio(text) {
  const config = loadAIConfig();
  const baseUrl = config.tts_url || 'https://godanasr-tts.hf.space';
  const voice = config.tts_voice || 'ar-EG-ShakirNeural';

  // تنظيف النص من الإيموجيز والماركداون حتى ينطقها الصوت بنعومة وبدون ذكر مسميات الرموز
  const cleanText = text
    .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1FA70}-\u{1FAFF}]/gu, '')
    .replace(/[\*\#\_~`>]/g, '')
    .trim();

  if (!cleanText) return null;

  const requestUrl = `${baseUrl}/tts?text=${encodeURIComponent(cleanText)}&voice=${voice}`;
  console.log(`🔊 جاري توليد صوت شاكر عبر Edge TTS (${voice})...`);

  const response = await fetch(requestUrl);
  if (!response.ok) {
    throw new Error(`خطأ من سيرفر TTS: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

// إرسال ريكورد صوتي للمستخدم مع الرد النصي في الـ Caption أو كنص احتياطي
async function sendVoiceResponse(ctx, replyText, captionPrefix = '') {
  try {
    await ctx.sendChatAction('record_voice');
    const audioBuffer = await generateSpeechAudio(replyText);

    if (audioBuffer) {
      const fullCaption = captionPrefix ? `${captionPrefix}\n\n${replyText}` : replyText;
      await ctx.replyWithVoice(
        { source: audioBuffer, filename: 'voice.mp3' },
        { caption: fullCaption.length <= 1024 ? fullCaption : undefined }
      );
      if (fullCaption.length > 1024) {
        await ctx.reply(fullCaption);
      }
      return true;
    }
  } catch (ttsErr) {
    console.error('⚠️ خطأ في خدمة تحويل النص لصوت TTS:', ttsErr.message);
  }

  // في حال تعذر الصوت نرسل الرد كنص عادي
  const fallback = captionPrefix ? `${captionPrefix}\n\n${replyText}` : replyText;
  await ctx.reply(fallback);
  return false;
}

// استقبال كل الرسائل النصية
bot.on('text', async (ctx) => {
  const userText = ctx.message.text.trim();
  const userId = ctx.from.id;

  // فحص رغبة العميل في الرد الصوتي
  if (shouldDisableVoice(userText)) {
    userPrefersVoice.delete(userId);
  } else if (shouldReplyWithVoice(userText)) {
    userPrefersVoice.add(userId);
  }

  const wantsVoice = userPrefersVoice.has(userId);

  if (wantsVoice) {
    await ctx.sendChatAction('record_voice');
  } else {
    await ctx.sendChatAction('typing');
  }

  try {
    const reply = await generateAIResponse(userId, userText);

    if (wantsVoice) {
      await sendVoiceResponse(ctx, reply);
    } else {
      await ctx.reply(reply);
    }

    // تسجيل المحادثة في السجلات
    const currentCfg = loadAIConfig();
    logger.addLog({
      user: ctx.from,
      messageType: wantsVoice ? 'text_to_voice' : 'text',
      userMessage: userText,
      botReply: reply,
      provider: currentCfg.provider,
      model: currentCfg.provider === 'groq' ? currentCfg.groq_model : currentCfg.gemini_model
    });
  } catch (err) {
    console.error(`❌ خطأ أثناء معالجة الرد للمستخدم [${userId}]:`, err.message);
    let errMsg = `⚠️ حدث خطأ أثناء معالجة الرد:\n${err.message}`;
    if (err.message.includes('API_KEY_INVALID') || err.message.includes('API key')) {
      errMsg = '⚠️ يبدو أن مفتاح API غير صالح أو غير مفعّل. تأكد من صحة المفتاح في ai_model.txt.';
    }
    await ctx.reply(errMsg);
  }
});

// استقبال ومعالجة الرسائل الصوتية والريكوردات (Voice & Audio)
bot.on(['voice', 'audio'], async (ctx) => {
  const userId = ctx.from.id;
  const isVoice = !!ctx.message.voice;
  const fileId = isVoice ? ctx.message.voice.file_id : ctx.message.audio.file_id;
  const originalFileName = isVoice ? 'voice.ogg' : (ctx.message.audio?.file_name || 'audio.mp3');

  console.log(`🎙️ استلام رسالة صوتية من المستخدم [${userId}]...`);

  // إظهار للمستخدم أن البوت يستمع للريكورد
  await ctx.sendChatAction('record_voice');

  try {
    // 1. جلب رابط الملف وتنزيله من سيرفرات تليجرام
    const fileLink = await ctx.telegram.getFileLink(fileId);
    const response = await fetch(fileLink.href);

    if (!response.ok) {
      throw new Error(`تعذر تنزيل الملف الصوتي من تليجرام: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(arrayBuffer);

    // 2. تحويل الصوت إلى نص عبر Groq Whisper (whisper-large-v3)
    await ctx.sendChatAction('typing');
    const transcribedText = await transcribeAudioWithGroq(audioBuffer, originalFileName);

    if (!transcribedText) {
      await ctx.reply('عذراً، لم أتمكن من سماع أو تمييز أي كلام في التسجيل. ممكن تجربه تاني أو تبعته كتابة؟ 🤝');
      return;
    }

    console.log(`📝 [${userId}] النص المفرغ: "${transcribedText}"`);

    // فحص ما إذا كان العميل ذكر في صوته أنه لا يعرف القراءة أو طلب رداً صوتياً
    if (shouldDisableVoice(transcribedText)) {
      userPrefersVoice.delete(userId);
    } else if (shouldReplyWithVoice(transcribedText)) {
      userPrefersVoice.add(userId);
    }

    const wantsVoice = userPrefersVoice.has(userId);

    // 3. إرسال النص إلى الذكاء الاصطناعي (Gemini أو Groq)
    const reply = await generateAIResponse(userId, transcribedText);

    // 4. إرسال الرد للمستخدم (ريكورد صوتي إذا كان يفضل الصوت، أو نصياً مسبوقاً بـ "سمعتك")
    if (wantsVoice) {
      await sendVoiceResponse(ctx, reply, 'سمعتك 🎙️');
    } else {
      const finalMessage = `سمعتك 🎙️\n\n${reply}`;
      await ctx.reply(finalMessage);
    }

    // تسجيل المحادثة الصوتية في السجلات
    const currentCfg = loadAIConfig();
    logger.addLog({
      user: ctx.from,
      messageType: wantsVoice ? 'voice_to_voice' : 'voice',
      userMessage: transcribedText,
      botReply: reply,
      provider: currentCfg.provider,
      model: currentCfg.provider === 'groq' ? currentCfg.groq_model : currentCfg.gemini_model
    });

  } catch (err) {
    console.error(`❌ خطأ أثناء معالجة الصوت للمستخدم [${userId}]:`, err.message);
    let errMsg = `⚠️ حدث خطأ أثناء معالجة الرسالة الصوتية:\n${err.message}`;
    if (err.message.includes('API key') || err.message.includes('groq_key')) {
      errMsg = '⚠️ يرجى التأكد من كتابة مفتاح Groq API صالح في ai_model.txt.';
    }
    await ctx.reply(errMsg);
  }
});

// معالجة الأخطاء غير المتوقعة
bot.catch((err, ctx) => {
  console.error(`❌ خطأ عام للبوت في التحديث ${ctx.updateType}:`, err);
});

// تشغيل خادم لوحة التحكم وعرض السجلات
logger.startLogsServer(3344);

// تشغيل البوت عبر Long Polling
console.log('====================================');
console.log('🤖 جاري تشغيل بوت Ader Sales عبر Polling...');
const cfg = loadAIConfig();
console.log(`📡 المزود النشط: ${cfg.provider.toUpperCase()}`);
console.log(`💡 الموديل: ${cfg.provider === 'groq' ? cfg.groq_model : cfg.gemini_model}`);
console.log('📊 لوحة تحكم السجلات: http://localhost:3344 أو عبر فتح dashboard.html مباشرة');
console.log('====================================');

bot.launch().then(() => {
  console.log('✅ البوت متصل وشغال الآن بنجاح محلياً! يستقبل ويرد على تليجرام.');
}).catch((err) => {
  console.error('❌ تعذر تشغيل البوت:', err.message);
  if (err.message.includes('ETIMEDOUT') || err.message.includes('getMe failed') || err.message.includes('ECONNRESET') || err.message.includes('ENOTFOUND')) {
    console.log('----------------------------------------------------');
    console.log('⚠️ تنبيه: تعذر الوصول إلى سيرفر تليجرام (api.telegram.org).');
    console.log('💡 يرجى تشغيل برنامج Cloudflare WARP أو VPN على جهازك.');
    console.log('----------------------------------------------------');
  }
});

// إيقاف التشغيل بأمان
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
