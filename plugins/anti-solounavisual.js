/**
 * Gestore Anti-Media: Consente solo messaggi "Visualizza una volta"
 */
export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]

  // Se la funzione non è attiva nel database, lo Shinigami ignora la chat
  if (!chat?.antimedia) return false

  // Gli admin, i proprietari del quaderno e Blood sono immuni
  if (m.fromMe || isAdmin || isOwner || isSam) return false
  if (!isBotAdmin) return false

  // Escludiamo i messaggi "View Once" (V1, V2 e Estensioni)
  const isViewOnce = m.message?.viewOnceMessage || 
                     m.message?.viewOnceMessageV2 || 
                     m.message?.viewOnceMessageV2Extension

  if (isViewOnce) return false

  // Controlliamo se è un media normale (Immagine o Video) permanente
  const hasNormalMedia = !!m.message?.imageMessage || !!m.message?.videoMessage

  if (hasNormalMedia) {
    // Elimina la traccia dal registro
    await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant,
      },
    }).catch(() => {})

    // Messaggio estetico in puro stile Ryuk
    await conn.sendMessage(m.chat, {
      text: `✒️ *DEATH NOTE SYSTEM* \n_Hai provato a lasciare una traccia permanente nel mio mondo..._\n────────────────────────────\n💀 *TARGET:* @${m.sender.split('@')[0]}\n📁 *RILEVATO:* File multimediale statico\n❌ *AZIONE:* Cancellazione immediata\n────────────────────────────\n\n𓃦 ⚠️ *REGOLA DEL QUADERNO:* \nIn questo spazio sono tollerati solo i media evanescenti ("Visualizza una volta"). Non mi piace accumulare ricordi umani inutili. 🍎`,
      mentions: [m.sender],
    }).catch(() => {})

    return true
  }

  return false
}

// --- LOGICA COMANDO (Attiva/Disattiva) ---
export async function handler(m, { conn, args, isAdmin, isOwner }) {
  if (!m.isGroup) return false
  if (!(isAdmin || isOwner)) return m.reply('❌ _Questo comando appartiene solo ai possessori del quaderno._')

  const chat = global.db.data.chats[m.chat]
  let active = args[0]?.toLowerCase()

  if (active === 'on' || active === 'attiva' || active === '1') {
    chat.antimedia = true
    m.reply('📓 *Protocollo Anti-Media attivato.*\n_Da adesso accetterò soltanto immagini e video "Visualizza una volta"._ 🍎')
  } else if (active === 'off' || active === 'disattiva' || active === '0') {
    chat.antimedia = false
    m.reply('📓 *Protocollo Anti-Media disattivato.*\n_Gli umani possono tornare a riempire la memoria di questo spazio._')
  } else {
    m.reply(`𓃦 *Uso corretto del quaderno:* \n.antimedia on/off`)
  }
}

handler.command = ['antimedia']
handler.group = true
handler.admin = true

export { before }
