const socketIO = require('socket.io');
const express = require('express');
const qrcode = require('qrcode');
const login_model = require('./models/login')

const socketRun = (client, server) => {
  const io = socketIO(server);

  io.on("connection", function (socket) {
    socket.emit("message", "Connecting...");

    client.on("qr", (qr) => {
      console.log("QR RECEIVED", qr);
      qrcode.toDataURL(qr, (err, url) => {
        socket.emit("qr", url);
        socket.emit("message", "Qrcode received, Silahkan Scan dari aplikasi Whatsapp di handphone");
      });
    });

    client.on('loading_screen', (percent, message) => {
        console.log('LOADING SCREEN', percent, message)
        socket.emit("loading", message)
    })

    client.on("ready", () => {
      console.log("Client is ready!");
      // socket.emit("message", "Whatsapp sudah ready");
      login_model.update_login_wa(1)
      socket.emit("ready", "Whatsapp ready");
    });

    client.on("authenticated", (session) => {
      console.log("cek AUTHENTICATED :: ", client.info);
      socket.emit("message", "Whatsapp sudah authenticated");
      socket.emit("authenticated", "Whatsapp authenticated");
      sessionCfg = session;

      if (session) {
        fs.writeFile(
          SESSION_FILE_PATH,
          JSON.stringify(session),
          function (err) {
            if (err) {
              console.error(err);
            }
          }
        );
      }
    })

    client.on('disconnected', (reason) => {
      socket.emit("logout", 'Client was logged out');
      console.log('Client was logged out', reason);
      
      try {

        login_model.update_login_wa(0)
        // Destroy actual browser
        // client.destroy()
        // client.initialize()

        //delete session path
        // const pathToDir = path.join(__dirname, "../.wwebjs_auth")
        // console.log('delete dir session ... ')
        // console.log(fs.rmdirSync(pathToDir, { recursive: true }))

        // // Send command to restart the instance
        // setTimeout(() => {
        //   console.log('Restarting ...');
        //   whatsapp_web(server)
        // } ,300)

      } catch (error) {
        console.error('Error on session finished. %s', error);
      }
  })

  });
};

module.exports = socketRun