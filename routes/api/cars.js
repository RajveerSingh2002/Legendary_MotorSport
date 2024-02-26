const express = require("express");
const router = express.Router();
var ObjectId = require("mongodb").ObjectId;
// const { requireAuth } = require("../../middleware/authMiddleware");
const Car = require("../../models/Car");

router.get("/", (req, res) => {
	Car.find().lean()
    .then((data) => {
      if (!data) {
        res.status(400).send("Data not found");
      } else {
				res.render(
					'index.hbs',
					{
							cars: data
					}
        )
      }
    })
    .catch((err) => console.log(err));
});

router.get("/car/:_id", (req, res) => {
  x = req.params._id;
  Car.findOne({ car_id: x }).lean()
    .then((data) => {
      if (!data) {
        return res.status(404).send("Route not found");
      } 
      else {
        res.render(
					'car_detail_page',
					{
							car: data
					}
        )
      }
    })
    .catch((err) => {
      console.log(err);
      res.status(500).send(err);
    });
});

module.exports = router;
