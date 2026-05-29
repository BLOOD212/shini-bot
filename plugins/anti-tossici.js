const insultiebs = [
    "b[4a@]st[4a@]rd[0o]",
    "[sS]tr[o0]n[zZ][oa4@]",
    "f[i1][gG][4aA]",
    "[cC][4aA][zZ][zZ][o0]",
    "p[e3]n[e3]",
    "c[o0]gl[i1][o0]n[e3i1]",
    "f[i1][gG][l1][i1][oO]d[i1]p[uU]tt[4aA]n[4aA]",
    "p[uU]tt[4aA]n[e3][l1][l1][4aA]",
    "p[uU]tt[4aA]n[0o4aA]",
    "tr[o0][i1][4aA]",
    "z[o0]cc[o0]l[4aA]",
    "b[4aA]g[4aA]sc[i1][4aA]",
    "[pP]r[0oO][sS5][tT][i1][tT][uU][tT][e3a]",
    "f[rR][o0][cC][i1][oO]",
    "f[i1][nN][o0][cC][cC][hH][i1][oO]",
    "[e3][fF][fF][e3]mm[i1]n[4aA]t[o0]",
    "succh[i1][a4][l1][a4o0]", 
    "succh[i1][a4]m[e3][l1][oO]",
    "[sS][uU][cC][cC][hH][i1][4aA]",
    "[pP][o0]mp[i1]n[4aA]r[o0a]",
    "v[4aA][fF][fF][4aA][nN][cC][uU][l1][oO]",
    "[fF][o0][tT][tT][uU]t[o0a]",
    "[nN][e3][gG]r[o0a]",
]
const ir = new RegExp(`\\b(${insultiebs.join('|')})\\b`, 'i')

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) {
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    
    const isToxic = ir.exec(m.text)
    if (isToxic && chat.antiToxic && !isOwner && !isAdmin) {
        user.warn += 1
        const decodedSender = conn.decodeJid(m.sender)
        const badWord = isToxic[0]
        
        // Primo e secondo avvertimento
        if (user.warn < 3) {
            await conn.sendMessage(m.chat, {
                text: `✒️ *DEATH NOTE SYSTEM* \n_Tossicità rilevata... Il registro rifiuta espressioni impure._\n────────────────────────────\n💀 *TARGET:* @${decodedSender.split('@')[0]}\n🤬 *TERMINE:* "${badWord}"\n🩸 *AMMONIZIONE:* ${user.warn}/3\n────────────────────────────\n\n𓃦 _Purifica il tuo linguaggio prima che sia tardi._ 🍎`,
                mentions: [decodedSender]
            }, { quoted: m })
        }
        
        // Terzo avvertimento ed eliminazione
        if (user.warn >= 3) {
            user.warn = 0
            await conn.sendMessage(m.chat, {
                text: `✒️ *DEATH NOTE SYSTEM* \n_La tua condotta ha consumato l'ultima riga di tolleranza..._\n────────────────────────────\n💀 *TARGET:* @${decodedSender.split('@')[0]}\n❌ *VIOLAZIONE:* Comportamento altamente tossico\n🩸 *SANZIONE:* GIUDIZIO (Espulsione)\n────────────────────────────\n\n_Il tuo nome è stato scritto sulla pagina._ 🍎`,
                mentions: [decodedSender]
            }, { quoted: m })
            
            if (isBotAdmin) {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            } else {
                await conn.sendMessage(m.chat, { text: `𓃦 ⚠️ _Impossibile eseguire il giudizio capitale. Lo Shinigami richiede i poteri di Admin._` }, { quoted: m })
            }
        }
    }
    return true
}

export default handler
