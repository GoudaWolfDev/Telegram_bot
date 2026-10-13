const fs = require('fs');
const path = require('path');
const http = require('http');

const BASE_DIR = __dirname;
const LOGS_JSON_PATH = path.join(BASE_DIR, 'logs.json');
const LOGS_JS_PATH = path.join(BASE_DIR, 'logs.js');

// قراءة السجلات الحالية
function getLogs() {
  try {
    if (fs.existsSync(LOGS_JSON_PATH)) {
      const raw = fs.readFileSync(LOGS_JSON_PATH, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('⚠️ خطأ أثناء قراءة ملف logs.json:', err.message);
  }
  return [];
}

// حفظ سجل جديد
function addLog({ user, messageType, userMessage, botReply, provider, model }) {
  const logs = getLogs();

  const now = new Date();
  const newEntry = {
    id: 'log_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
    timestamp: now.toISOString(),
    formattedTime: now.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    formattedDate: now.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }),
    user: {
      id: user.id,
      username: user.username ? `@${user.username}` : 'بدون معرف',
      fullName: [user.first_name, user.last_name].filter(Boolean).join(' ') || 'عميل غير مسمى',
      firstName: user.first_name || ''
    },
    messageType: messageType || 'text', // 'text' | 'voice'
    userMessage: userMessage || '',
    botReply: botReply || '',
    provider: provider || 'unknown',
    model: model || 'unknown'
  };

  // إضافة السجل في البداية (الأحدث أولاً)
  logs.unshift(newEntry);

  // الاحتفاظ بآخر 1000 سجل
  if (logs.length > 1000) {
    logs.length = 1000;
  }

  try {
    // 1. كتابة ملف JSON
    fs.writeFileSync(LOGS_JSON_PATH, JSON.stringify(logs, null, 2), 'utf-8');

    // 2. كتابة ملف JS لدعم الفتح المباشر في المتصفح دون قيود CORS
    const jsContent = `// تم التحديث تلقائياً بواسطة بوت أَدِرْ
window.BOT_LOGS = ${JSON.stringify(logs, null, 2)};
`;
    fs.writeFileSync(LOGS_JS_PATH, jsContent, 'utf-8');
  } catch (err) {
    console.error('⚠️ تعذر كتابة ملفات السجلات:', err.message);
  }

  return newEntry;
}

// مسح السجلات
function clearLogs() {
  try {
    fs.writeFileSync(LOGS_JSON_PATH, JSON.stringify([], null, 2), 'utf-8');
    fs.writeFileSync(LOGS_JS_PATH, 'window.BOT_LOGS = [];\n', 'utf-8');
    return true;
  } catch (err) {
    console.error('⚠️ تعذر مسح السجلات:', err.message);
    return false;
  }
}

// خادم محلي خفيف لتغذية الواجهة ببيانات حية
function startLogsServer(port = 3344) {
  const server = http.createServer((req, res) => {
    // تمكين CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    const url = new URL(req.url, `http://localhost:${port}`);

    if (url.pathname === '/api/logs' && req.method === 'GET') {
      const logs = getLogs();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify(logs));
      return;
    }

    if (url.pathname === '/api/clear' && req.method === 'POST') {
      clearLogs();
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ success: true, message: 'تم مسح السجلات بنجاح' }));
      return;
    }

    // تقديم صفحة dashboard.html إذا تم فتح الرابط مباشرة
    if (url.pathname === '/' || url.pathname === '/dashboard.html') {
      const dashPath = path.join(BASE_DIR, 'dashboard.html');
      if (fs.existsSync(dashPath)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(dashPath));
        return;
      }
    }

    // تقديم logs.js
    if (url.pathname === '/logs.js') {
      if (fs.existsSync(LOGS_JS_PATH)) {
        res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
        res.end(fs.readFileSync(LOGS_JS_PATH));
        return;
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not Found');
  });

  server.listen(port, () => {
    console.log(`📊 خادم لوحة السجلات يعمل على الرابط: http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`ℹ️ المنفذ ${port} مشغول حالياً، لوحة السجلات تعمل بنمط الملفات.`);
    } else {
      console.error('⚠️ خطأ في خادم السجلات:', err.message);
    }
  });

  return server;
}

// تهيئة الملفات إذا لم تكن موجودة
if (!fs.existsSync(LOGS_JSON_PATH)) {
  fs.writeFileSync(LOGS_JSON_PATH, JSON.stringify([], null, 2), 'utf-8');
}
if (!fs.existsSync(LOGS_JS_PATH)) {
  fs.writeFileSync(LOGS_JS_PATH, 'window.BOT_LOGS = [];\n', 'utf-8');
}

module.exports = {
  getLogs,
  addLog,
  clearLogs,
  startLogsServer
};
