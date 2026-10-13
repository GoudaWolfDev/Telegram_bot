# 🤖 Ader Sales Telegram Bot | بوت تليجرام المبيعات الذكي (عادر)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-green.svg)](https://nodejs.org/)
[![Telegraf](https://img.shields.io/badge/Telegraf-v4-blue.svg)](https://telegraf.js.org/)

[English](#english) | [العربية](#العربية)

---

## العربية

بوت تليجرام ذكي ومساعد مبيعات لشركة **عادر (Ader)**، مدعوم بأحدث نماذج الذكاء الاصطناعي (Google Gemini و Groq) مع دعم تحويل النص إلى صوت (TTS)، بالإضافة إلى لوحة تحكم وسجلات تفاعلية.

### ✨ المميزات الرئيسية
- 🧠 **دعم متعدد لمزودي الذكاء الاصطناعي**: التكامل مع Google Gemini (`gemini-1.5-flash`) و Groq (`llama-3.3-70b-versatile`).
- 🗣️ **دعم الصوت (TTS)**: تحويل الردود إلى رسائل صوتية عبر Hugging Face TTS.
- 💾 **ذاكرة جلسات المحادثة**: حفظ سياق المحادثة لكل مستخدم لردود طبيعية وسلسة.
- 📊 **لوحة تحكم تفاعلية**: واجهة ويب (`dashboard.html`) لمتابعة سجلات المحادثات وتحليل تفاعلات المستخدمين.
- 📜 **نظام تسجيل متقدم (Logging)**: تسجيل الرسائل والمحادثات في ملفات JSON منظمة.
- ⚡ **تشغيل بنقرة واحدة**: ملفات تشغيل سريعة لنظام ويندوز (`.bat`).

---

### 🚀 متطلبات التشغيل
- [Node.js](https://nodejs.org/) (الإصدار 18 أو أحدث)
- توكن بوت تليجرام من [@BotFather](https://t.me/BotFather)
- مفتاح API لـ Google Gemini أو Groq

---

### ⚙️ التثبيت والإعداد

1. **تثبيت الحزم البرمجية:**
   ```bash
   npm install
   ```

2. **إعداد توكن البوت:**
   - ضع توكن البوت في ملف `token_bot.txt`.

3. **إعداد نماذج الذكاء الاصطناعي:**
   - افتح ملف `ai_model.txt` وضع مفاتيح الـ API:
     ```ini
     provider=gemini
     gemini_model=gemini-1.5-flash
     gemini_key=YOUR_GEMINI_API_KEY
     groq_model=llama-3.3-70b-versatile
     groq_key=YOUR_GROQ_API_KEY
     ```

4. **تشغيل البوت:**
   - عبر سطر الأوامر:
     ```bash
     npm start
     ```
   - أو بالنقر المزدوج على `run_bot.bat`.

5. **فتح لوحة السجلات:**
   - انقر مرتين على `open_logs.bat` أو `عرض_السجلات.bat` لفتح لوحة التحكم `dashboard.html`.

---

### 📄 الترخيص
هذا المشروع مرخص بموجب رخصة [MIT](LICENSE).

---

## English

An intelligent Telegram sales assistant bot for **Ader**, powered by Google Gemini and Groq AI models with Text-to-Speech (TTS) capabilities, interactive analytics dashboard, and session management.

### ✨ Features
- 🧠 **Multi-Provider AI**: Native support for Google Gemini (`gemini-1.5-flash`) and Groq (`llama-3.3-70b-versatile`).
- 🗣️ **Text-to-Speech (TTS)**: Converts responses into voice messages using Hugging Face TTS.
- 💾 **Conversational Memory**: Maintains user session history for accurate, contextual replies.
- 📊 **Interactive Dashboard**: Web dashboard (`dashboard.html`) to visualize conversation logs and user metrics.
- 📜 **Structured Logging**: Clean JSON-based logging system (`logger.js`).
- ⚡ **One-Click Launch**: Windows `.bat` scripts for seamless local deployment.

---

### 🚀 Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- Telegram Bot Token from [@BotFather](https://t.me/BotFather)
- Google Gemini API Key and/or Groq API Key

---

### ⚙️ Installation & Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Bot Token:**
   - Paste your Telegram bot token inside `token_bot.txt`.

3. **Configure AI Models & Keys:**
   - Edit `ai_model.txt` with your preferred provider and API keys:
     ```ini
     provider=gemini
     gemini_model=gemini-1.5-flash
     gemini_key=YOUR_GEMINI_API_KEY
     groq_model=llama-3.3-70b-versatile
     groq_key=YOUR_GROQ_API_KEY
     ```

4. **Start the Bot:**
   - Via CLI:
     ```bash
     npm start
     ```
   - Or double-click `run_bot.bat`.

5. **Access the Logs Dashboard:**
   - Double-click `open_logs.bat` or open `dashboard.html` directly in your browser.

---

### 📄 License
This project is licensed under the [MIT License](LICENSE).
