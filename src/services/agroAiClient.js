export async function queryLocalAgroAI(prompt) {
  const DEFAULT = 'http://192.168.43.100:5000/api/chat';
  const endpoint = process.env.REACT_APP_AGROAI_ENDPOINT || DEFAULT;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'tinyllama', prompt, stream: false }),
    });

    if (!response.ok) throw new Error(`TinyLLaMA error ${response.status}`);

    const data = await response.json();
    return data.response?.trim() || '🤷🏽 TinyLLaMA gave no response.';
  } catch (err) {
    console.error('AgroAI TinyLLaMA error:', err);
    return '⚠️ TinyLLaMA not available.';
  }
}
