let puliti = [];

function rilevaDispositivoCheck(msgID = '') {
  if (!msgID) return 'sconosciuto';
  if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) return 'bot';
  if (msgID.startsWith('false_') || msgID.startsWith('true_')) return 'web';
  if (msgID.startsWith('3EB0') && /^[A-Z0-9]+$/.test(msgID)) return 'webbot';
  if (msgID.includes(':')) return 'desktop';
  if (/^[A-F0-9]{32}$/i.test(msgID)) return 'android';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) return 'ios';
  if (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0')) return 'ios';
  if (msgID.startsWith('3EB0')) return 'android_old';
  return 'sconosciuto';
}

export async function before(m, { conn, isAdmin, isOwner, isSam }) {
  const chat = global.db.data.chats[m.chat];

  // Controllo attivazione Antibot
  if (!chat?.antiBot) return;
  if (!m.isGroup || !m.sender || !m.key?.id) return;

  // Gli admin, Blood e il bot stesso sono immuni
  if (isAdmin || isOwner || isSam || m.fromMe) return;

  const msgID = m.key?.id;
  const device = rilevaDispositivoCheck(msgID);
  const sospettiDispositivi = ['bot', 'web', 'webbot'];

  // Se il dispositivo non è tra quelli sospetti, esce
  if (!sospettiDispositivi.includes(device)) return;

  const metadata = await conn.groupMetadata(m.chat);
  const botNumber = conn.user.jid;
  const autorizzati = [botNumber, metadata.owner, ...puliti];

  // Se l'utente è in whitelist o è il fondatore, esce
  if (autorizzati.includes(m.sender)) return;

  // Esecuzione sanzione (Rimozione dal gruppo)
  await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

  // Messaggio estetico in puro stile Ryuk
  const text = `✒️ *DEATH NOTE SYSTEM* 
_Un'intelligenza artificiale estranea tenta di imitarmi..._
────────────────────────────
💀 *TARGET:* @${m.sender.split('@')[0]}
🤖 *DISPOSITIVO:* ${device.toUpperCase()}
🩸 *AZIONE:* Eliminazione Immediata
────────────────────────────

𓃦 ⚠️ *REGOLA DEL QUADERNO:* 
I finti bot e le connessioni web non autorizzate alterano l'ordine delle anime. Questo spazio appartiene al possessore del Death Note.

_Gli umani sono davvero interessanti..._ 🍎`

  await conn.sendMessage(m.chat, {
    text,
    mentions: [m.sender],
    contextInfo: {
      externalAdReply: {
        title: 'R Y U K  S E C U R I T Y',
        body: 'Falsa presenza rilevata ed eliminata.',
        thumbnailUrl: 'https://qu.ax/TfUj.jpg',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  });
}
