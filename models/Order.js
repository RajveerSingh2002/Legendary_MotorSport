const mongoose = require('mongoose')
const Schema = mongoose.Schema

const OrderSchema = new Schema({
    car_id: {
        type: String,
        required: true
    },
    car_color: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    addr_hname: {
        type: String,
        required: true
    },
    addr_sname: {
        type: String,
        required: true
    },
    addr_cname: {
        type: String,
        required: true
    },
    addr_pcode: {
        type: String,
        required: true
    },
    name_on_card: {
        type: String,
        required: true
    },
    card_number: {
        type: String,
        required: true
    },
    card_pin: {
        type: String,
    },
})

module.exports = Order = mongoose.model('order', OrderSchema)