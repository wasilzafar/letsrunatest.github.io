/**
 * Shared log message function for demo pages.
 * Appends a timestamped log entry to the element with id="log".
 * @param {string} type - Event type label (e.g., 'round', 'match', 'winner')
 * @param {string} msg - Event description
 */
function logMsg(type, msg) {
    const el = document.getElementById('log');
    const t = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    const cls = type === 'winner' ? 'w' : 'a';
    entry.innerHTML = `<span class="t">[${t}]</span> <span class="${cls}">${type}</span> — ${msg}`;
    if (el.querySelector('em')) el.innerHTML = '';
    el.insertBefore(entry, el.firstChild);
}
