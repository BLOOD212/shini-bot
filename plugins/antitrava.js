let handler = m => m
const ZALGO_REGEX = /[\u0300-\u036f\u1ab0-\u1aff\u1dc0-\u1dff\u20d0-\u20ff\ufe20-\ufe2f]{3,}/g;

function extractText(m) {
    if (!m) return '';
    let text = m.text || m.caption || '';
    const poll = m.message?.pollCreationMessageV3 || m.message?.pollCreationMessage;
    if (poll?.name) {
        text += ' ' + poll.name;
        poll.options?.forEach(opt => text += ' ' + opt.optionName);
    }
    return text;
}

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup || !m.sender) return false;

    const chat = global.db.data.chats[m.chat];
    if (!chat || !chat.antitrava) return true;

    // Immunità per gli amministratori, i padroni del quaderno e Blood
    if (isAdmin || isOwner || isSam || m.fromMe) return true;

    const text = extractText(m);
    if (!text) return true;

    const isTooLong = text.length > 4000;
    const zalgoMatches = text.match(ZALGO_REGEX) || [];
    const isZalgo = zalgoMatches.length > 5;

    if (isTooLong || isZalgo) {
        // Cancellazione immediata della minaccia per preservare il registro
        await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {});

        // Lo Shinigami recide il legame ed espelle l'utente se ha i poteri
        if (isBotAdmin) {
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {});
        }

        const userTag = m.sender.split('@')[0];
        const reason = isTooLong ? 'Testo infinito (Trava/Lag)' : 'Caratteri corrotti (Zalgo/Crash)';

        // Messaggio estetico in puro stile Ryuk
        const textMsg = `✒️ *DEATH NOTE SYSTEM* 
_Un patetico tentativo di corrompere la memoria di questo mondo..._
────────────────────────────
💀 *TARGET:* @${userTag}
⚠️ *RILEVATO:* Tentativo di Crash / Lagging
❌ *AZIONE:* ESTIRPAZIONE IMMEDIATA
🩸 *MOTIVO:* ${reason}
────────────────────────────

𓃦  *PROTOCOLLO DI SICUREZZA:*
Gli umani che usano codici distorti o testi smisurati per destabilizzare l'ordine del quaderno vengono rimossi senza alcuna esitazione.

_La tua traccia è stata cancellata prima di bloccarmi._ 🍎`;

        await conn.sendMessage(m.chat, {
            text: textMsg,
            mentions: [m.sender],
            contextInfo: {
                externalAdReply: {
                    title: 'R Y U K  C R A S H  P R O T E C T I O N',
                    body: 'Minaccia di corruzione testuale neutralizzata.',
                    thumbnailUrl: 'https://qu.ax/TfUj.jpg',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        });

        return true;
    }

    return true;
}

export default handler;
