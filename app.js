/* ...existing code... (no prior code) ... */

/*
  This module talks to the embedded websim API available globally as `websim`.
  It asks the assistant "What is the most recent game you know about?" and
  displays the response. We keep a tiny conversation history to provide context.
*/

const askBtn = document.getElementById('askBtn');
const loader = document.getElementById('loader');
const content = document.getElementById('content');
const result = document.getElementById('result');
const scopeSel = document.getElementById('gameScope');

let conversationHistory = [];

function setLoading(loading) {
  loader.hidden = !loading;
  if (loading) {
    result.classList.remove('empty');
    content.innerHTML = '';
  }
}

function showMessage(html) {
  result.classList.remove('empty');
  content.innerHTML = html;
}

/* Build a clear, focused question for the assistant */
function buildUserMessage(scopeLabel) {
  return {
    role: 'user',
    content: `What is the most recent video game you know about${scopeLabel ? ' ('+scopeLabel+')' : ''}? Please give: title, release date (or "unknown"), platforms, short one-sentence description, and the source of the information if you know it. Keep it concise.`
  };
}

async function askAssistant() {
  setLoading(true);
  const scopeLabel = scopeSel.options[scopeSel.selectedIndex].text;
  const userMsg = buildUserMessage(scopeLabel);
  conversationHistory.push(userMsg);
  conversationHistory = conversationHistory.slice(-8);

  try {
    // show a temporary hint; websim.chat API expects messages array
    const completion = await websim.chat.completions.create({
      messages: conversationHistory
    });

    const reply = completion.content?.trim() || 'No answer returned.';
    conversationHistory.push({ role: 'assistant', content: reply });

    const timestamp = new Date().toLocaleString();
    showMessage(`<div>
      <div class="content-title">${reply.split('\n')[0]}</div>
      <div class="content-body">${escapeHtml(reply)}</div>
      <div class="content-meta">Answered: ${timestamp}</div>
    </div>`);
  } catch (err) {
    console.error(err);
    showMessage(`<span style="color:#b00020">Error contacting AI. Check console.</span>`);
  } finally {
    setLoading(false);
  }
}

/* simple html escape to avoid injection from model content */
function escapeHtml(text) {
  const map = { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]).replace(/\n/g, '<br>');
}

askBtn.addEventListener('click', askAssistant);

/* initial hint */
showMessage('Click "Ask AI" to fetch the most recent game the model knows about.');
/* ...existing code... */

