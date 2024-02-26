const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CarSchema = new Schema({
		car_id: {
      type: String,
      required: false
    },
    img_link: {
      type: String,
      required: false
    },
    img_alt: {
      type: String,
      required: true
    },
    car_name: {
      type: String,
      required: true
    },
    car_price: {
      type: String,
      required: true
    }
  });

module.exports = Car = mongoose.model("car", CarSchema);
