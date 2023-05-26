const { Client, LegacySessionAuth, LocalAuth, Message  } = require('whatsapp-web.js');
const socketRun = require('./socket')
const useChat = require('./chat')
const fs = require('fs');
const path = require('path')

const whatsapp_web = (server, client, reload) => {
  // const SESSION_FILE_PATH = "./whatsapp-session.json";
  // let sessionCfg;
  // if (fs.existsSync(SESSION_FILE_PATH)) {
  //   sessionCfg = require(SESSION_FILE_PATH);
  // }

  // const client = new Client({ puppeteer: { headless: true }, session: sessionCfg })

  // const client = new Client({
  //   // authStrategy: new LegacySessionAuth({
  //   //     session: sessionCfg
  //   // }),
  //   restartOnAuthFail: true,
  //   authStrategy: new LocalAuth({ clientId: "client-one" }),
  //   // puppeteer: {
  //     //     args: [
  //     //       '--no-sandbox',
  //     //       '--disable-setuid-sandbox'
  //     //     ],
  //     // }
  // })
  

  console.log('function whatsapp web start ... ')

  client.on("message_received", async (msg) => {
    console.log("message_received 5555 ", msg);
    console.log(client.getWWebVersion());
    // msg.fetchMessages
    // await console.log(client.getChats())
  });

  if (reload) {
    client.destroy()
  }

  client.initialize()

  useChat(client)

  // socket io
  socketRun(client, server)
  
};

module.exports = whatsapp_web