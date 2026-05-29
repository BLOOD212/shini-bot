export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antisondaggi) return false

  // Immunità per Admin, i possessori del quaderno e il bot stesso
  if (m.fromMe || isAdmin || isOwner || isSam) return false

  // Verifica se il messaggio è la creazione di un sondaggio
  const isPollCreation =
    !!m.message?.pollCreationMessage ||
    !!m.message?.pollCreationMessageV3 ||
    !!m.message?.pollCreationMessageV3Extension

  if (!isPollCreation) return false

  // Se lo shinigami ha i poteri (isBotAdmin), cancella la traccia dal registro delle anime
  if (isBotAdmin) {
    await conn
      .sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant,
        },
      })
      .catch(() => {})
  }

  // Configurazione dinamica dell'azione in base ai permessi del bot
  const statusNote = isBotAdmin 
    ? `❌ *AZIONE:* Rimozione Immediata` 
    : `⚠️ *STATO:* Mancanza di poteri (Non sono Admin), traccia non rimossa.`;

  // Messaggio estetico in puro stile Ryuk
  const text = `✒️ *DEATH NOTE SYSTEM* 
_Gli umani cercano pareri collettivi per rassicurare le proprie anime..._
────────────────────────────
💀 *TARGET:* @${m.sender.split('@')[0]}
📊 *RILEVATO:* Creazione Sondaggio
🩸 *STATO:* ${statusNote}
────────────────────────────

𓃦 ⚠️ *REGOLA DEL QUADERNO:* 
Le votazioni e i sondaggi sono vietati. In questo spazio non esiste democrazia, decide solo chi stringe il patto con gli occhi dello Shinigami. 

_Raccogliere opinioni è così noioso..._ 🍎`;

  await conn
    .sendMessage(m.chat, {
      text,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: 'R Y U K  S E C U R I T Y',
          body: 'Blocco sondaggi universale attivo.',
          thumbnailUrl: 'https://qu.ax/TfUj.jpg',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    })
    .catch(() => {})

  return true
}

export { before as handler }
