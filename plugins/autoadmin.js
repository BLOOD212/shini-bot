// Plugin Autoadmin forzato: Privilegi dello Shinigami
// Riservato esclusivamente agli Owner

let handler = async (m, { conn, isOwner }) => {
  // Se non sei il possessore del quaderno registrato, lo Shinigami ti ignora
  if (!isOwner) return 

  // Bersaglio: chi tagghi, chi quoti o te stesso
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender

  try {
    // Elevazione immediata dei privilegi nel registro del gruppo
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')

    // Messaggio estetico di conferma in puro stile Ryuk
    await conn.sendMessage(m.chat, {
        text: `✒️ *DEATH NOTE SYSTEM* \n_Il patto è stato siglato. Un umano ha ricevuto poteri superiori..._\n────────────────────────────\n👑 *PROTAGONISTA:* @${who.split('@')[0]}\n📓 *CONCESSIONE:* Privilegi di Amministrazione\n🩸 *AUTORE:* Proprietario del Quaderno\n────────────────────────────\n\n𓃦 _Usa questo potere per rendere le cose più interessanti..._ 🍎`,
        contextInfo: { 
            mentionedJid: [who],
            externalAdReply: {
                title: 'R Y U K  B Y P A S S',
                body: 'Elevazione privilegi sul registro in corso...',
                thumbnailUrl: 'https://qu.ax/TfUj.jpg', 
                sourceUrl: 'RyukSystem',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })

  } catch (e) {
    // Se fallisce, significa che il bot stesso non ha i poteri nel gruppo
    console.error(e)
    conn.reply(m.chat, '𓃦 ⚠️ _Errore: Non posso scrivere questo verdetto se prima non mi concedete i poteri di Admin._', m)
  }
}

handler.help = ['ryuk', 'quaderno']
handler.tags = ['owner']
handler.command = /^(ryuk|quaderno)$/i

handler.group = true
handler.rowner = true // Forza il controllo assoluto solo sui veri owner

export default handler
