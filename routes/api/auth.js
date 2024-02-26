const express = require("express");
const bcrypt = require("bcryptjs");
const jsonwt = require("jsonwebtoken");
const passport = require("passport");
const { requireAuth } = require("../../middleware/authMiddleware");
const multer = require('multer')
const path = require('path')

var storage = multer.diskStorage({
  filename: function(req, file, cb){
      cb(
          null,
          file.fieldname + '-' + Date.now() + path.extname(file.originalname)
      )
  },
  destination: function(req, file, cb) {
      cb(
          null,
          __dirname + '/../../public/images/dynamic'
      )
  }
})

var upload = multer({storage: storage}).single('carpic')


// getting setting
const settings = require("../../config/settings");

const router = express.Router();

const Car = require("../../models/Car");
const Person = require("../../models/User");
const Order = require("../../models/Order");

/* -------------------------------------------------------- REGISTER PAGE FORM ----------------------------------------------- */
//Render registerPage.hbs form
router.get("/register", function (req, res) {
  res.render("registerPage");
});

/* -------------------------------------------------------- LOGIN PAGE FORM ----------------------------------------------- */
//Render loginPage.hbs form
router.get("/login", function (req, res) {
  res.render("loginPage");
});
/* -------------------------------------------------------- About US FORM ----------------------------------------------- */
router.get("/aboutus", function (req, res) {
  res.render("aboutus");
});
/* -------------------------------------------------------- REGISTER USER ----------------------------------------------- */
// Route to register a user. URL : /api/auth/register
router.post("/api/register", (req, res) => {
  // check if username is already in collection.
  Person.findOne({ username: req.body.username })
    .then((person) => {
      if (person) {
        res.status(400).send("Username already there.");
      } else {
        //create new object with data provided by the Client
        const person = Person({
          name: req.body.name,
          username: req.body.username,
          password: req.body.password,
        });
        // Encrypting the password using bcryptjs
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(person.password, salt, (err, hash) => {
            if (err) {
              return res.status(400).send("Not Registered, Contact Admin!");
            } else {
              // Hashed password assigned instead of regular one
              person.password = hash;
              // Add new person with hashed password to collection
              person
                .save()
                .then(
                  //Send Feedback Message
                  res.render("thanks", {
                    msg: "for registering.",
                  }),
                )
                .catch((err) => res.send(err.message));
            }
          });
        });
      }
    })
    .catch((err) => res.send(err));
});

/* -------------------------------------------------------- LOG IN USER ----------------------------------------------- */
// Route to login a user. URL : /api/auth/login
router.post("/api/login", (req, res) => {
  // Use data from submiting the form
  username = req.body.username;
  password = req.body.password;
  // Check if username is already in collection.
  Person.findOne({ username: req.body.username }).then((person) => {
    //USER EXISTS IN THE SYSTEM
    if (person) {
      // compare the password
      bcrypt
        .compare(password, person.password)
        .then((isCompared) => {
          //PASSWORD CORRECT
          if (isCompared) {
            //Generate JWT for that User
            const payload = {
              id: person.id,
              name: person.name,
              username: person.username,
              role: person.role
            };
            jsonwt.sign(
              payload,
              settings.secret,
              { expiresIn: 3600 },
              (err, token) => {
                res.cookie("jwt", token, { httpOnly: false });
                res.redirect('/dashboard');
              },
            );
          }
          //PASSWORD INCORRECT
          else {
            res.status(401).send("Password is not correct");
          }
        })
        .catch();
    }
    //USER DOES NOT EXISTS IN THE SYSTEM
    else {
      res.status(400).send("Username is not there.");
    }
  });
});
/* -------------------------------------------------------- LOGOUT ROUTE ----------------------------------------------- */
router.post("/api/logout", (req, res) => {
  // delete the cookies
  res.cookie("jwt", '', { httpOnly: false });
  res.render("single_msg_page", {
    msg: "You are logged out.",
  })
});

/* -------------------------------------------------------- PRIVATE ROUTE ----------------------------------------------- */

router.get("/dashboard",requireAuth,  function (req, res) {
    if (res.locals.role == 'customer') {
      Order.aggregate([
        {
          $lookup: {
            from: "cars",
            localField: "car_id",
            foreignField: "car_id",
            as: "orderdetails"
          }
        },
        {
          $unwind: "$orderdetails"
        },
        { $match: { "username": res.locals.username } },
      ])
      .then((result) => {
          res.render("dashboard", {
            orders: result
          })
      })
      .catch((error) => {
        console.log(error);
      });
    }
    else if(res.locals.role == 'admin') {
      Order.aggregate([
        {
          $lookup: {
            from: "cars",
            localField: "car_id",
            foreignField: "car_id",
            as: "orderdetails"
          }
        },
        {
          $unwind: "$orderdetails"
        },
      ])
      .then((orders) => {
          Person.find().lean()
            .then((users) => {
              res.render("admin_dashboard", {
                orders: orders,
                users: users
              })
            })
      })
      .catch((error) => {
        console.log(error);
      });
    }
    else {
      res.render("error", {
        msg: 'No role found.'
      })
    }
});

router.post("/api/checkout",requireAuth,  function (req, res) {
  res.render("checkout", {
    car_id: req.body.car_id,
    requested_car_color: req.body.car_color,
    car_price: req.body.car_price,
    username: res.locals.username
  });
});

router.post("/api/buy",requireAuth,  function (req, res) {
  const car_checkout_obj = Order({
    car_id: req.body.car_id,
    car_color: req.body.car_color,
    username: res.locals.username,
    email: req.body.email,
    phone: req.body.phone,
    addr_hname: req.body.addr_hname,
    addr_sname: req.body.addr_sname,
    addr_cname: req.body.addr_cname,
    addr_pcode: req.body.addr_pcode,
    name_on_card: req.body.name_on_card,
    card_number: req.body.card_number.substr(-4, 4),
  });

  car_checkout_obj.save()
    .then(
      () => {
        res.redirect('/dashboard');
      }
    )
    .catch((err) => res.send(err.message));
});

//Render addCars.hbs form
router.get("/addCar", function (req, res) {
  res.render("addCars");
});

router.post("/api/add-car", (req, res) => {
  upload(req, res, error => {
    if (error) {
      console.log(error.message)
      return res.status(404).send('Not saved')
    } else {
      Car.find().sort( { car_id: -1 } ).limit(1).lean()
        .then((latestCar) => {
          const car = Car({
            car_id: latestCar.car_id,
            img_link: '/images/dynamic/' + req.file.filename,
            img_alt: req.file.filename,
            car_name: req.body.carname,
            car_price: req.body.carprice
          });
        })
        car.save()
          .then(
            //Send Feedback Message
            res.render("Success", {
              msg: "The car is added to catalogue.",
            }),
          )
          .catch((err) => res.send(err.message));
    }
  })
})

module.exports = router;
