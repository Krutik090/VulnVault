// src/utils/htmlUtils.js

// Detect likely HTML-encoded string
export const isHtmlEncoded = (str = '') => /&lt;|&gt;|&amp;[#a-z0-9]+;/.test(str);

// Decode HTML entities in browser (works for strings with &lt; &gt; etc.)
export const decodeHtmlEntities = (encoded = '') => {
  if (!encoded) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = encoded;
  return txt.value;
};

// Optionally: basic encode (if you ever need it)
export const encodeHtmlEntities = (raw = '') => {
  if (!raw) return '';
  const txt = document.createElement('textarea');
  txt.textContent = raw;
  return txt.innerHTML;
};
