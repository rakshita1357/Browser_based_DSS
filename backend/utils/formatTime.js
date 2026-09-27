// Formats a JS Date as "YYYY-MM-DD HH:mm:ss" in IST, without the misleading "Z" (UTC) suffix
function formatIST(date) {
  if (!date) return null;
  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

module.exports = { formatIST };