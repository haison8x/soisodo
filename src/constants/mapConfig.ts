const MAPTILER_KEYS = [
  '8DY7FmNFHpdvQiaVc2gb',
  'MrRM0R9tiLuljOo6bryv',
  'CmOoC00U4JPBaeKIwsdm',
  'tERxmTWmMJkKrT63Kjem',
  'vHeEq4jU81GrG9bI3gLS',
];

// Pick one random key when the JS bundle initializes
export const MAPTILER_KEY = MAPTILER_KEYS[Math.floor(Math.random() * MAPTILER_KEYS.length)];
