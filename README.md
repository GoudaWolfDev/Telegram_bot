<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</p>

<h1 align="center">
  🤖 Ader Sales Telegram Bot | بوت مبيعات ادر الذكي
</h1>

<p align="center">
  <strong>Next-Gen AI Sales Assistant for Telegram powered by Google Gemini & Groq</strong>
  <br />
  <strong>مساعد مبيعات ذكي عبر تليجرام مدعوم بنماذج Gemini و Groq</strong>
</p>

<p align="center">
  <a href="https://opensource.org/licenses/MIT"><img src="https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge" alt="License: MIT" /></a>
  <a href="https://nodejs.org/"><img src="https://img.shields.io/badge/Node.js-18%2B-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node.js" /></a>
  <a href="https://telegraf.js.org/"><img src="https://img.shields.io/badge/Telegraf-v4-blue?style=for-the-badge&logo=telegram&logoColor=white" alt="Telegraf" /></a>
  <a href="https://ai.google.dev/"><img src="https://img.shields.io/badge/Gemini_AI-Enabled-orange?style=for-the-badge&logo=google&logoColor=white" alt="Gemini" /></a>
  <a href="https://groq.com/"><img src="https://img.shields.io/badge/Groq-Supported-purple?style=for-the-badge" alt="Groq" /></a>
</p>

<p align="center">
  <a href="#english">English</a> • <a href="#العربية">العربية</a>
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/andreasbm/readme/master/assets/lines/rainbow.png" width="100%" />
</p>

---

## English

An intelligent sales and customer engagement Telegram bot tailored for **Ader**, integrated with Google Gemini and Groq AI models. It features pluggable architecture, conversational session memory, and an interactive real-time logging dashboard.

### 🌟 Key Features
- 🧠 **Multi-AI Engine Support**: Easily switch between Google Gemini (`gemini-1.5-flash`) and Groq (`llama-3.3-70b-versatile`).
- 🎙️ **Custom TTS Integration**: Flexible architecture allowing you to integrate your own Text-to-Speech (TTS) service or provider seamlessly.
- 💾 **Contextual Session Memory**: Retains user conversation history to maintain natural, ongoing dialogues.
- 📊 **Real-time Dashboard**: Built-in web analytics interface (`dashboard.html`) to visualize and inspect chats and client interactions.
- 📜 **Structured Logging**: Clean, automated JSON logging powered by [logger.js](file:///c:/Users/Gouda/Desktop/New%20folder%20(7)/ader_bot/logger.js).
- ⚡ **Zero Hassle Execution**: Ready-to-use Windows batch scripts (`.bat`) for instant execution.

---

### 📋 Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or newer)
- Telegram Bot Token obtained from [@BotFather](https://t.me/BotFather)
- API key for Google Gemini and/or Groq

---

### 🛠️ Quick Installation & Setup

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Set Telegram Bot Token:**
   - Put your bot token in `token_bot.txt`.

3. **Configure AI & Services:**
   - Update `ai_model.txt` with your API credentials and endpoints:
     ```ini
     provider=gemini
     gemini_model=gemini-1.5-flash
     gemini_key=YOUR_GEMINI_API_KEY
     groq_model=llama-3.3-70b-versatile
     groq_key=YOUR_GROQ_API_KEY
     # Custom TTS configuration: connect your own TTS service endpoint
     tts_url=YOUR_CUSTOM_TTS_ENDPOINT
     tts_voice=YOUR_VOICE_ID
     ```

4. **Run the Bot:**
   - Using terminal:
     ```bash
     npm start
     ```
   - Or simply double-click `run_bot.bat`.

5. **Open Dashboard / Logs:**
   - Double-click `open_logs.bat` to launch `dashboard.html` in your browser.

---

### 📄 License
This project is open-source and licensed under the [MIT License](file:///c:/Users/Gouda/Desktop/New%20folder%20(7)/ader_bot/LICENSE).

---

## العربية

بوت تليجرام ذكي ومساعد مبيعات وخدمة عملاء لشركة **عادر (Ader)**، يعتمد على أحدث نماذج الذكاء الاصطناعي (Google Gemini و Groq) مع معمارية مرنة تتيح ربط خدمات تحويل النص إلى صوت خاصة بك، ومزود بلوحة تحكم تفاعلية لمتابعة السجلات.

### 🌟 أبرز المميزات
- 🧠 **دعم محركات ذكاء اصطناعي متعددة**: مرونة التبديل والعمل مع Google Gemini أو Groq.
- 🎙️ **إمكانية دمج TTS خاص بك**: معمارية مرنة تتيح لك ربط وتكامل أي خدمة تحويل النص إلى كلام (Text-to-Speech) خاصة بك بسهولة.
- 💾 **ذاكرة سياق المحادثات**: تتبع تاريخ المحادثة لكل عميل لتقديم ردود ذكية ومترابطة.
- 📊 **لوحة تحكم تفاعلية**: واجهة ويب (`dashboard.html`) لمراجعة سجلات المحادثات وتحليل تفاعل العملاء.
- 📜 **تسجيل منظم للسجلات**: حفظ وتحليل العمليات والرسائل بصيغة JSON منظمة.
- ⚡ **تشغيل سريع**: ملفات تنفيذية جاهزة للويندوز (`.bat`) للتشغيل بضغطة زر.

---

### 📋 متطلبات التشغيل
- [Node.js](https://nodejs.org/) (إصدار 18 أو أحدث)
- توكن بوت تليجرام من [@BotFather](https://t.me/BotFather)
- مفتاح API لـ Google Gemini أو Groq

---

### 🛠️ خطوات التثبيت والتشغيل

1. **تثبيت الحزم المطلوبة:**
   ```bash
   npm install
   ```

2. **إدخال توكن البوت:**
   - أضف التوكن الخاص بك داخل ملف `token_bot.txt`.

3. **إعداد نماذج الذكاء الاصطناعي والخدمات:**
   - عدّل ملف `ai_model.txt` وضع المفاتيح والروابط:
     ```ini
     provider=gemini
     gemini_model=gemini-1.5-flash
     gemini_key=YOUR_GEMINI_API_KEY
     groq_model=llama-3.3-70b-versatile
     groq_key=YOUR_GROQ_API_KEY
     # تخصيص خدمة تحويل النص إلى صوت: يمكنك ربط الخدمة أو الرابط الخاص بك
     tts_url=YOUR_CUSTOM_TTS_ENDPOINT
     tts_voice=YOUR_VOICE_ID
     ```

4. **تشغيل البوت:**
   - عبر سطر الأوامر:
     ```bash
     npm start
     ```
   - أو بالنقر المزدوج على ملف `run_bot.bat`.

5. **استعراض السجلات ولوحة التحكم:**
   - اضغط مرتين على `open_logs.bat` أو `عرض_السجلات.bat` لفتح لوحة `dashboard.html`.

---

### 📄 الترخيص
هذا المشروع مرخص بموجب رخصة [MIT](file:///c:/Users/Gouda/Desktop/New%20folder%20(7)/ader_bot/LICENSE).
