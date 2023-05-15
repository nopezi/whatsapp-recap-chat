const { Client, LegacySessionAuth, LocalAuth, Message  } = require('whatsapp-web.js');
const express = require('express');
const sessions = require('express-session');
const cookieParser = require("cookie-parser");

const route = require('./route')
const connectToWhatsApp = require('./wa_baileys')


const http = require('http');

const whatsapp_web = require('./whatsapp_web');

const app = express();
const server = http.createServer(app);
require('events').EventEmitter.defaultMaxListeners = infinity;
// const cors = require('cors');

// // app.use(cors())
app.use(express.json())
app.use(express.urlencoded({
	extended: true
}))

// app.use(cookieParser())

// const oneDay = 1000 * 60 * 60 * 24;
// //session middleware
// app.use(sessions({
//     secret: "thisismysecrctekeyfhrgfgrfrty84fwir767",
//     saveUninitialized:true,
//     cookie: { maxAge: oneDay },
//     resave: false
// }))

// whatsapp web.js

// let client

const client = new Client({
    // authStrategy: new LegacySessionAuth({
    //     session: sessionCfg
    // }),
    restartOnAuthFail: true,
    authStrategy: new LocalAuth({ clientId: "client-one" }),
    // puppeteer: {
      //     args: [
      //       '--no-sandbox',
      //       '--disable-setuid-sandbox'
      //     ],
      // }
  })

whatsapp_web(server, client)
// connectToWhatsApp(server)

// route express
route(app, server, client)

const port = process.env.PORT || "9000";

server.listen(port, function() {
	console.log('App running on *:' + port)
});