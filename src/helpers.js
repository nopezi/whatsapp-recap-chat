const moment = require('moment-timezone');

const tanggal_bulan = (bulan) => {
    // let ubah_bulan
    switch (bulan) {
        case 1:
            return 'Januari'
            break;

        case 2:
            return 'Februari'
            break;

        case 3:
            return 'Maret'
            break;

        case 4:
            return 'April'
            break;

        case 5:
            return 'Mei'
            break;

        case 6:
            return 'Juni'
            break;

        case 7:
            return 'Juli'
            break;

        case 8:
            return 'Agustus'
            break;

        case 9:
            return 'September'
            break;

        case 10:
            return 'Oktober'
            break;

        case 11:
            return 'November'
            break;
            
        case 12:
            return 'Desember'
            break;
    }
}

const tanggal_sekarang = () => {
    let tanggal = new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Bangkok",
        year: 'numeric',
        month: "2-digit",
        day: "2-digit",
        // hour: "2-digit",
        // minute: "2-digit",
        // second: "2-digit",
      });
      
      return moment(tanggal.replace(/\./g, ':')).format('YYYY-DD-MM')
}

const convert_date = (timestamp) => {
    const waktu = Math.floor(timestamp * 1000)
    
    console.log('tanggal sebelum di ubah ', waktu)
    const tanggal_clear = moment.tz(waktu, 'Asia/Jakarta').format('YYYY-MM-DD HH:mm:ss')
    console.log('tanggal ubah :: ', tanggal_clear)

    return tanggal_clear
}

const tanggal_sekarang_v2 = () => {
    return moment.tz(new Date(), 'Asia/Jakarta').format('YYYY-MM-DD')
}

module.exports = {
    tanggal_bulan,
    tanggal_sekarang,
    convert_date,
    tanggal_sekarang_v2
}