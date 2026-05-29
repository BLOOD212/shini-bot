const handler = m => m;

handler.before = async function (m, { conn, participants, isBotAdmin }) {
  if (!m.isGroup) return;
  if (!isBotAdmin) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antinuke) return;

  // Monitora: Cambio nome (21), Rimozione (28), Promozione (29), Retrocessione (30)
  if (![21, 28, 29, 30].includes(m.messageStubType)) return;

  const sender = m.key?.participant || m.participant || m.sender;
  if (!sender) return;

  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';

  // --- PROTEZIONE OWNER DEL BOT ---
  const BOT_OWNERS = global.owner
    .filter(o => o[0])
    .map(o => o[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');

  const localWhitelist = chat.whitelist || [];

  let ownerGroup = null;
  try {
    const metadata = await conn.groupMetadata(m.chat);
    ownerGroup = metadata.owner || metadata.subjectOwner;
  } catch {
    ownerGroup = null;
  }

  // LISTA AUTORIZZATI (Bot, Proprietari del Bot, Whitelist, Creatore Gruppo)
  const allowed = [
    botJid,
    ...BOT_OWNERS,
    ...localWhitelist, 
    ownerGroup
  ].filter(Boolean);

  // Se l'azione è compiuta da un OWNER del bot o autorizzato, lo Shinigami non interviene
  if (allowed.includes(sender)) return;

  if (m.messageStubType === 28) {
    const affected = m.messageStubParameters?.[0];
    if (affected === sender) return;
  }

  const senderData = participants.find(p => p.jid === sender);
  if (!senderData?.admin) return;

  // FILTRO GIUDIZIO: Rimuove i poteri a tutti i presenti eccetto i veri possessori
  const usersToDemote = participants
    .filter(p => p.admin)
    .map(p => p.jid)
    .filter(jid => jid && !allowed.includes(jid));

  if (!usersToDemote.length && m.messageStubType !== 21) return;

  if (usersToDemote.length) {
    await conn.groupParticipantsUpdate(m.chat, usersToDemote, 'demote');
  }

  // Isola il gruppo in sola lettura
  await conn.groupSettingUpdate(m.chat, 'announcement');

  const action =
    m.messageStubType === 21 ? 'Alterazione del nome' :
    m.messageStubType === 28 ? 'Rimozione ingiustificata' :
    m.messageStubType === 29 ? 'Falsa elezione admin' :
    'Retrocessione abusiva';

  // Messaggio estetico in puro stile Ryuk
  const text = `✒️ *DEATH NOTE SYSTEM* 
_Un tentativo di rivolta ha scosso l'ordine del quaderno..._
────────────────────────────
💀 *REBELLE:* @${sender.split('@')[0]}
❌ *ATTO:* ${action} NON Autorizzato
🩸 *RITORSIONE:* Reset Gerarchico
────────────────────────────

𓃦 🔻 *SENTENZA APPLICATA:*
➤ *Potere revocato:* Privilegi amministrativi azzerati.
➤ *Sigillo:* Gruppo isolato e chiuso in sola lettura.
➤ I veri possessori del quaderno sono immuni e sono stati avvisati.

_Il caos degli umani non disturba il disegno di Blood._ 🍎`;

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      mentionedJid: [sender, ...usersToDemote, ...BOT_OWNERS].filter(Boolean),
      externalAdReply: {
        title: 'R Y U K  A N T I - N U K E',
        body: 'Protocollo di emergenza Shinigami eseguito.',
        thumbnailUrl: 'https://qu.ax/TfUj.jpg',
        sourceUrl: 'RYUKANTINUKE',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    },
  });
};

export default handler;
