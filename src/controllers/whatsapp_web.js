const { Client, LegacySessionAuth, LocalAuth, Message  } = require('whatsapp-web.js');

const getInfoClient = async () => {

    const client = new Client({
        // authStrategy: new LegacySessionAuth({
        //     session: sessionCfg
        // }),
        restartOnAuthFail: true,
        authStrategy: new LocalAuth({ clientId: "client-one" }),
    })

    await console.log(client.getInfoClient())

    return await {
        status: true,
        message: 'data info client whatsapp bot',
        data: client.info
    }

}

module.exports = {
    getInfoClient
}