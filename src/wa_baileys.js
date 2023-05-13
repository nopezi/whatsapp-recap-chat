// const { default: makeWASocket, DisconnectReason } = require('@adiwajshing/baileys')
const {
  default: waConnect,
  useSingleFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  generateForwardMessageContent,
  prepareWAMessageMedia,
  generateWAMessageFromContent,
  generateMessageID,
  downloadContentFromMessage,
  makeInMemoryStore,
  jidDecode,
  proto,
  getContentType,
} = require("@adiwajshing/baileys");
const pino = require("pino");
const { Boom } = require("@hapi/boom");
const chat_model = require("./models/chat");
const helpers = require("./helpers");

const konek_wa = () => {
  async function connectToWhatsApp() {
    const { state, saveState } = useSingleFileAuthState(`./adelia_angel.json`);
    // const { version, isLatest } = await fetchLatestBaileysVersion()
    // console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const client = waConnect({
      logger: pino({ level: "silent" }),
      printQRInTerminal: true,
      qrTimeout: 1000000000,
      browser: ["Wa-OpenAI - Sansekai", "Safari", "3.0"],
      syncFullHistory: true,
      auth: state,
    });

    // client.public = true

    // client.serializeM = (m) => smsg(client, m, store)
    client.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect } = update;
      // if(connection === 'close') {
      //     const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      //     console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
      //     // reconnect if not logged out
      //     if(shouldReconnect) {
      //         connectToWhatsApp()
      //     }
      // } else if(connection === 'open') {
      //     console.log('opened connection')
      // }
      if (connection === "close") {
        console.log("cek DisconnectReason ", DisconnectReason);
        let reason =
          new Boom(lastDisconnect?.error)?.output.statusCode !==
          DisconnectReason.loggedOut;
        console.log(
          "connection closed due to ",
          lastDisconnect?.error,
          ", reconnecting ",
          reason
        );

        if (reason) {
          connectToWhatsApp();
        }
      } else if (connection === "open") {
        console.log("Bot conneted to server");
        // client.sendMessage(owner+'@s.whatsapp.net', { text: `Bot started!\n\njangan lupa support ya bang :)\n${donet}` })
        // kirim_socket(client)
      }
    });
    client.ev.on("creds.update", saveState);
    client.ev.on("messages.upsert", async (pesanMasuk) => {
      //   console.log(JSON.stringify(pesanMasuk, undefined, 2));
      console.log('pesan baru ::: ')
      console.log(pesanMasuk)
      console.log(pesanMasuk?.messages)
      console.log(pesanMasuk?.messages[0].key)
      console.log(pesanMasuk?.messages?.extendedTextMessage)

      console.log("replying to", pesanMasuk.messages[0].key.remoteJid);
      // console.log(await client)

      const m = pesanMasuk.messages[0];

      const pesan = m.message?.conversation
        ? m.message.conversation
        : m.message?.imageMessage?.caption
        ? m.message.imageMessage.caption
        : m.message?.videoMessage?.caption
        ? m.message.videoMessage.caption
        : m.message?.extendedTextMessage?.text
        ? m.message.extendedTextMessage.text
        : m.message?.buttonsResponseMessage?.selectedButtonId
        ? m.message.buttonsResponseMessage.selectedButtonId
        : m.message?.listResponseMessage?.singleSelectReply.selectedRowId
        ? m.message.listResponseMessage.singleSelectReply.selectedRowId
        : m.message?.templateButtonReplyMessage?.selectedId
        ? m.message.templateButtonReplyMessage.selectedId
        : m.message?.buttonsResponseMessage?.selectedButtonId ||
          m.message?.listResponseMessage?.singleSelectReply.selectedRowId ||
          m?.text
        ? m.message.buttonsResponseMessage?.selectedButtonId ||
          m.message.listResponseMessage?.singleSelectReply.selectedRowId ||
          m.text
        : m.message?.conversation
        ? m.message.conversation
        : m.message?.extendedTextMessage?.text
        ? m.message.extendedTextMessage.text
        : "";

      if (pesan) {
        if (pesanMasuk.messages[0].key.remoteJid != 'status@broadcast') {
          chat_model.simpan_pesan({
            pengirim: m.key.fromMe
              ? client.user.id
              : pesanMasuk.messages[0].key.remoteJid,
            penerima: !m.key.fromMe
              ? client.user.id
              : pesanMasuk.messages[0].key.remoteJid,
            pesan: pesan,
            tanggal: helpers.convert_date(m.messageTimestamp), //tanggal_clear,
            timestamp: m.messageTimestamp,
            nama_pengirim: pesanMasuk.messages[0]?.pushName
          });
        }
      }
      // await sock.sendMessage(m.messages[0].key.remoteJid!, { text: 'Hello there!' })
    });
    return client;
  }

  connectToWhatsApp();
};
// run in main file
module.exports = konek_wa;
