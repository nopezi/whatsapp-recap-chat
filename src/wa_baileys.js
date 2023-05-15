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
const socket = require("./socket2");
const socketIO = require("socket.io");
const login_model = require("./models/login");
const fs = require("fs");
const path = require("path");
const qrcode = require("qrcode");

const konek_wa = (server) => {
  console.log("konek_wa ::");
  const io = socketIO(server);
  async function connectToWhatsApp() {
    const { state, saveState } = useSingleFileAuthState(`./config.json`);
    // const { version, isLatest } = await fetchLatestBaileysVersion()
    // console.log(`using WA v${version.join('.')}, isLatest: ${isLatest}`)

    const client = waConnect({
      logger: pino({ level: "silent" }),
      // printQRInTerminal: true,
      // qrTimeout: 1000,
      browser: ["Wa-OpenAI - Sansekai", "Safari", "3.0"],
      syncFullHistory: true,
      auth: state,
    });

    // client.public = true

    // socket(client, DisconnectReason, server)
    // io.on("connection", (socket) => {
    //   client.ev.on("connection.update", async (update) => {
    //     const { connection, lastDisconnect, qr, isNewLogin } = update;

    //     console.log("connection ", connection);
    //     console.log(
    //       "lastDisconnect ",
    //       lastDisconnect?.error?.output.statusCode
    //     );
    //     console.log("DisconnectReason ", DisconnectReason);
    //     console.log("cek qr ", qr);

    //     if (connection) {
    //       if (connection == "close") {
    //         if (lastDisconnect?.error?.output.statusCode == 401) {
    //           socket.emit("logout", "Client was logged out");
    //           console.log("Client was logged out");
    //           //delete session path
    //           const pathToDir = path.join(__dirname, "../config.json");

    //           if (fs.existsSync(pathToDir)) {
    //             console.log(
    //               "delete dir session ... ",
    //               fs.unlinkSync(pathToDir)
    //             );
    //             console.log("selesai delete dir");
    //             konek_wa(server);
    //           }
    //           // fs.access(pathToDir, (err, result) => {
    //           //   console.log("delete dir session ... ", err);
    //           //   if (!err) {
    //           //     // console.log(fs.rmdirSync(pathToDir, { recursive: true }));
    //           //   }
    //           // });
    //         } else {
    //           connectToWhatsApp();
    //         }
    //       } else {
    //         console.log("Bot conneted to server");
    //         login_model.update_login_wa(1);
    //         socket.emit("ready", "Whatsapp ready");
    //       }
    //     }

    //     if (qr) {
    //       qrcode.toDataURL(qr, (err, url) => {
    //         console.log("emit qr code ");
    //         socket.emit("qr", url);
    //         socket.emit(
    //           "message",
    //           "Qrcode received, Silahkan Scan dari aplikasi Whatsapp di handphone"
    //         );
    //       });
    //     }
    //   });
    // });

    let update_cek = ''

    // client.serializeM = (m) => smsg(client, m, store)
    client.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr, isNewLogin } = update;
      console.log("connection.update 2 ", update);
      console.log("lastDisconnect ", lastDisconnect);
      update_cek = update
      await io.on("connection", async (socket) => {
        await console.log("socket io ", update_cek);
        if (connection) {
          if (connection == "close") {
            login_model.update_login_wa(0);
            if (lastDisconnect?.error?.output.statusCode == 401) {
              socket.emit("logout", "Client was logged out");
              console.log("Client was logged out");
              //delete session path
              const pathToDir = path.join(__dirname, "../config.json");

              if (fs.existsSync(pathToDir)) {
                console.log(
                  "delete dir session ... ",
                  fs.unlinkSync(pathToDir)
                );
                console.log("selesai delete dir");
                konek_wa(server);
              }
            } else {
              konek_wa(server);
            }
          } else if (connection == "open") {
            console.log("Bot conneted to server");
            login_model.update_login_wa(1);
            socket.emit("ready", "Whatsapp ready");
          }
        }

        if (update.qr) {
          console.log("emit qr code ");
          qrcode.toDataURL(update.qr, (err, url) => {
            
            socket.emit("qr", url);
            socket.emit(
              "message",
              "Qrcode received, Silahkan Scan dari aplikasi Whatsapp di handphone"
            );
          });
        }
      });
      //   console.log('cek qr ', qr)
      //   await socket(update, server)
      //   // if(connection === 'close') {
      //   //     const shouldReconnect = (lastDisconnect.error as Boom)?.output?.statusCode !== DisconnectReason.loggedOut
      //   //     console.log('connection closed due to ', lastDisconnect.error, ', reconnecting ', shouldReconnect)
      //   //     // reconnect if not logged out
      //   //     if(shouldReconnect) {
      //   //         connectToWhatsApp()
      //   //     }
      //   // } else if(connection === 'open') {
      //   //     console.log('opened connection')
      //   // }
      //   if (connection === "close") {
      //     console.log("cek DisconnectReason ", DisconnectReason);
      //     let reason =
      //       new Boom(lastDisconnect?.error)?.output.statusCode !==
      //       DisconnectReason.loggedOut;
      //     console.log(
      //       "connection closed due to ",
      //       lastDisconnect?.error,
      //       ", reconnecting ",
      //       reason
      //     );

      //     if (reason) {
      //       connectToWhatsApp();
      //     }
      //   } else if (connection === "open") {
      //     console.log("Bot conneted to server");
      //     // client.sendMessage(owner+'@s.whatsapp.net', { text: `Bot started!\n\njangan lupa support ya bang :)\n${donet}` })
      //     // kirim_socket(client)
      //   }
    });
    client.ev.on("creds.update", saveState);
    client.ev.on("messages.upsert", async (pesanMasuk) => {
      //   console.log(JSON.stringify(pesanMasuk, undefined, 2));
      console.log("pesan baru ::: ");
      // console.log(pesanMasuk);
      // console.log(pesanMasuk?.messages);
      // console.log(pesanMasuk?.messages[0].key);
      // console.log(pesanMasuk?.messages?.extendedTextMessage);

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
        if (pesanMasuk.messages[0].key.remoteJid != "status@broadcast") {
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
            nama_pengirim: pesanMasuk.messages[0]?.pushName,
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
