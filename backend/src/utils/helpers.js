const { v4: uuidv4 } = require('uuid');

function generateOTP() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function generateId() {
  return uuidv4();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('hi-IN', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return 'सुप्रभात';      // Good morning
  if (hour < 17) return 'नमस्कार';       // Good afternoon
  return 'शुभ संध्या';                    // Good evening
}

function paginate(query, params, page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  return { query: `${query} LIMIT ? OFFSET ?`, params: [...params, limit, offset] };
}

function sanitizePhone(phone) {
  return phone.replace(/\D/g, '').slice(-10);
}

module.exports = { generateOTP, generateId, formatDate, getGreeting, paginate, sanitizePhone };
