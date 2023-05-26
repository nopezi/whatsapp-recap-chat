const { body, validationResult } = require("express-validator");
const login_model = require("./models/login");
const path = require("path");
const chat_model = require("./models/chat")
const controllers = require("./controllers/main")
const whatsapp_web = require('./whatsapp_web')
const connectToWhatsApp = require('./wa_baileys')

const route = (app, server, client) => {
  app.set("views", path.join(__dirname, "views"));
  app.set("view engine", "ejs");

  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST");
    res.setHeader(
      "Access-Control-Allow-Headers",
      "Content-Type, Authorization"
    );
    next();
  });

  var corsOptions = {
    origin: "http://example.com",
    optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  };

  let session;

  app.get("/privacy", (req, res) => {
    res.sendFile("views/index.html", { root: __dirname });
  });

  app.get("/", (req, res) => {
    res.render("admin", {
      session: req.session,
      url_base: req.headers.host,
    });
  });

  app.get("/login_wa", (req, res) => {

    login_model.get_login_wa((result,err) => {
      console.log('router get_login_wa ', result.login_wa)
      console.log('headers ', req.headers)
      if (result && result.login_wa == 1) {
        res.render("login_wa", {
          session: req.session,
          url_base: req.headers.host,
          logged: true
        })
      } else {
        if (client) {
          whatsapp_web(server, client, true)
        }
        // connectToWhatsApp(server)
        res.render("login_wa", {
          session: req.session,
          url_base: req.headers.host,
          logged: false
        })
      }
    })
  });

  app.get("/data_wa", (req, res) => {
    res.render("data_wa", {
      session: req.session,
      url_base: req.headers.host,
    });
  });

  app.get("/login", (req, res) => {
    res.render("login", {
      url_base: req.headers.host,
      session: req.session,
    });
  });

  app.get("/whatsapp_client_info", async (req, res) => {
    await res.json(controllers.whatsappWeb.getInfoClient())
  })

  app.post("/aksi_login", (req, res) => {
    // session = req.session
    // session.userid = 'coba'
    // req.session.save()

    login_model.login(req, (result, err) => {
      if (!err) {
        res.json(result);
      } else {
        res.json(err.message);
      }
    });
  });

  app.get("/get_session_login", (req, res) => {
    login_model.login(req, (req, response) => {
      res.json(response);
    });
  });

  app.get("/get_chat_wa", (req, res) => {
      chat_model.get_all_pesan({
        from: req.query.from,
        to: req.query.to
      }, (result, err) => {
        res.json(result)
      })
  });

  app.get("/logout", (req, res) => {
    req.session.destroy();
    res.redirect("/login");
  });

  // api send message
  app.post(
    "/send-message",
    [body("number").notEmpty(), body("message").notEmpty()],
    (req, res) => {
      const errors = validationResult(req).formatWith(({ msg }) => {
        return msg;
      });

      if (!errors.isEmpty()) {
        return res.status(422).json({
          status: false,
          response: errors.mapped(),
        });
      }

      const number = req.body.number;
      const message = req.body.message;

      client
        .sendMessage(number, message)
        .then((response) => {
          res.status(200).json({
            status: true,
            response: response,
          });
        })
        .catch((err) => {
          res.status(500).json({
            status: false,
            response: err,
          });
        });
    }
  );
};

module.exports = route;
