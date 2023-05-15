const socketIO = require("socket.io");
const express = require("express");
const qrcode = require("qrcode");
const login_model = require("./models/login");
const fs = require("fs");
const path = require("path");
const { Boom } = require("@hapi/boom");

const socketRun = (client, DisconnectReason, server) => {
  // const { connection, lastDisconnect, qr, isNewLogin } = update;
  const io = socketIO(server);

  io.on("connection", function (socket) {
    client.ev.on("connection.update", async (update) => {
      const { connection, lastDisconnect, qr, isNewLogin } = update;
      console.log("connection ", connection);
      console.log("lastDisconnect ", lastDisconnect);
      console.log("cek qr ", qr);

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

        //delete session path
        const pathToDir = path.join(__dirname, "../config.json");

        fs.access(pathToDir, (err, result) => {
          console.log("delete dir session ... ", result);
          if (!err) {
            console.log(fs.rmdirSync(pathToDir, { recursive: true }));
          }
        });
        socket.emit("logout", "Client was logged out")
        console.log("Client was logged out")

        if (reason) {
        //   connectToWhatsApp();
        }
      } else if (connection === "open") {
        console.log("Bot conneted to server")
        login_model.update_login_wa(1);
        socket.emit("ready", "Whatsapp ready")
      }
    });

    socket.emit("message", "Connecting...");
    console.log("cek qr from socket ", qr);
    if (qr) {
      qrcode.toDataURL(qr, (err, url) => {
        socket.emit("qr", url);
        socket.emit(
          "message",
          "Qrcode received, Silahkan Scan dari aplikasi Whatsapp di handphone"
        );
      });
    }

    // client.on('loading_screen', (percent, message) => {
    //     console.log('LOADING SCREEN', percent, message)
    //     socket.emit("loading", message)
    // })

    // client.on("ready", () => {
    //   console.log("Client is ready!");

    // });

    // client.on("authenticated", (session) => {
    //   console.log("cek AUTHENTICATED :: ", client.info);
    //   socket.emit("message", "Whatsapp sudah authenticated");
    //   socket.emit("authenticated", "Whatsapp authenticated");
    //   sessionCfg = session;

    //   if (session) {
    //     fs.writeFile(
    //       SESSION_FILE_PATH,
    //       JSON.stringify(session),
    //       function (err) {
    //         if (err) {
    //           console.error(err);
    //         }
    //       }
    //     );
    //   }
    // })

    //     client.on('disconnected', (reason) => {
    //       socket.emit("logout", 'Client was logged out');
    //       console.log('Client was logged out', reason);

    //       try {

    //         login_model.update_login_wa(0)
    //         // Destroy actual browser
    //         client.destroy()
    //         client.initialize()

    //         //delete session path
    //         // const pathToDir = path.join(__dirname, "../.wwebjs_auth")
    //         // console.log('delete dir session ... ')
    //         // console.log(fs.rmdirSync(pathToDir, { recursive: true }))

    //         // // Send command to restart the instance
    //         // setTimeout(() => {
    //         //   console.log('Restarting ...');
    //         //   whatsapp_web(server)
    //         // } ,300)

    //       } catch (error) {
    //         console.error('Error on session finished. %s', error);
    //       }
    //   })
  });
};

module.exports = socketRun;
