const modelChat = require('./models/chat')
const helpers = require('./helpers')

const chat = async (client) => {

    // GET DATA PESAN DI TERIMA OLEH BOT WA 
    client.on('message', msg => {
        console.log('=============================================')
        console.log('pesan di terima')
        console.log(client.info)
        if (msg.body == '!ping') {
            msg.reply('pong')
        } else if (msg.body == 'halo') {
            msg.reply('hai juga')
        }

        // console.log('getContact ', JSON.stringify(client.getContacts()))

        if (msg.from != 'status@broadcast') {
            modelChat.simpan_pesan({
                pengirim: msg.from,
                penerima: msg.to,
                pesan: msg.body,
                nama_pengirim: msg._data.notifyName, 
                tanggal: helpers.convert_date(msg?.timestamp), 
                timestamp: (msg?.timestamp) ? msg?.timestamp : '',
            })
        }
        
    })

    // get data pesan di kirim oleh wa bot
    client.on('message_ack', (msg, ack) => {
        /*
            == ACK VALUES ==
            ACK_ERROR: -1
            ACK_PENDING: 0
            ACK_SERVER: 1
            ACK_DEVICE: 2
            ACK_READ: 3
            ACK_PLAYED: 4
        */

        console.log('=============================================')
        console.log('pesan di kirim')
        console.log(msg)
        console.log(ack)

        modelChat.simpan_pesan({
            pengirim: msg.from,
            penerima: msg.to,
            pesan: msg.body,
            nama_pengirim: msg?._data?.notifyName,
            tanggal: (msg?.timestamp) ? helpers.convert_date(msg?.timestamp) : '',
            timestamp: (msg?.timestamp) ? msg?.timestamp : '',
        })
    
        if (ack == 3) {
            // The message was read
        }
    })

    client.on('group_update', (notification) => {
        // Group picture, subject or description has been updated.
        console.log('update', notification);
    })

    client.on('group_update', (notification) => {
        // Group picture, subject or description has been updated.
        console.log('update', notification);
    })

    client.on('change_state', state => {
        console.log('CHANGE STATE', state);
    })

}

module.exports = chat