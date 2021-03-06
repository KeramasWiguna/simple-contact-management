'use strict';

const
  router    = require('express').Router(),
  basicAuth = require('basic-auth'),
  Contact   = require('../models/contact'),
  fn        = require('../src/function');

const auth = (req, res, next) => {
  let user = basicAuth(req);
  if (!user || !user.name || !user.pass){
    return fn.unauthorized(res);
  }
  if (fn.authorizeUser(user)){
    next();
  } else {
    fn.unauthorized(res);
  }
};

router.use(auth);
router.get('/', (req, res) => {
  res
  .status(200)
  .json({
    success: true,
    message: 'Welcome to API (^_^)'
  });
});

router.route('/contacts')
  .get((req, res) => {
    Contact.find({}).sort({created_at: 'desc'})
    .select('name nick_name title email phone address company')
    .exec((err, data) => {
      if (err)
        res
        .json({
          success: false,
          message: 'Server Error'
        });
      res
      .status(200)
      .json({
        success: true,
        message: 'Get Data Succesfully',
        data: data,
        length: data.length
      });
    });
  })
  .post((req, res) => {
    let data = {
      name: (req.body.name)? req.body.name:"",
      title: (req.body.title)? req.body.title:"",
      email: (req.body.email)? req.body.email:[],
      phone: (req.body.phone)? req.body.phone:[],
      address: (req.body.address)? req.body.address:[],
      company: (req.body.company)? req.body.company :""
    };

    data.email   = fn.checkArray(req.body.email);
    data.phone   = fn.checkArray(req.body.phone);
    data.address = fn.checkArray(req.body.address);

    if (fn.checkEmpyProp(data)){
      if (fn.validateEmail(data.email)) {
        let contact = new Contact({
          name: data.name,
          title: data.title,
          email: data.email,
          phone: data.phone,
          address: data.address,
          company: data.company
        });

        contact.save((err) => {
          if (err)
            res
            .json({
              success: false,
              message: 'Server Error'
            });
          res
          .json({
            success: true,
            message: 'Data inserted'
          });
        });
      }else{
        res
        .json({
          success: false,
          message: 'Email not valid'
        });
      }
    } else {
      res
      .json({
        success: false,
        message: 'Please complete the data'
      });
    }
  });

router.route('/contacts/:name')
  .get((req, res) => {
    Contact.findOne({ nick_name: req.params.name })
    .select('name nick_name title email phone address company')
    .exec((err, data) => {
      if (err)
        res
        .json({
          success: false,
          message: 'Server Error'
        });
      if (data != null){
        res
        .status(200)
        .json({
          success: true,
          message: `Get Data ${req.params.name} Succesfully`,
          data: data
        });
      } else {
        res
        .json({
          success: false,
          message: `Data ${req.params.name} Not Found`
        });
      }
    });
  })
  .put((req, res) => {
    let new_data = {
      name: (req.body.name)? req.body.name:"",
      title: (req.body.title)? req.body.title:"",
      email: (req.body.email)? req.body.email:[],
      phone: (req.body.phone)? req.body.phone:[],
      address: (req.body.address)? req.body.address:[],
      company: (req.body.company)? req.body.company :""
    };

    new_data.email   = fn.checkArray(req.body.email);
    new_data.phone   = fn.checkArray(req.body.phone);
    new_data.address = fn.checkArray(req.body.address);
    if (fn.checkEmpyProp(new_data)){
      if (fn.validateEmail(new_data.email)) {
        Contact.findOneAndUpdate({
          nick_name: req.params.name
        }, new_data, (err, data) => {
          if (err)
            res
            .json({
              success: false,
              message: 'Server Error'
            });
          res
          .status(200)
          .json({
            success: true,
            message: 'Data Updated'
          });
        });
      } else {
        res
        .json({
          success: false,
          message: 'Email not valid'
        });
      }
    } else {
      res
      .json({
        success: false,
        message: 'Please complete the data'
      });
    }
  })
  .delete((req, res) => {
    Contact.findOneAndRemove({
      nick_name: req.params.name
    }, (err, data) => {
      if (err)
        res
        .json({
          success: false,
          message: 'Server Error'
        });
      if (data != null){
        res
        .status(200)
        .json({
          success: true,
          message: `Data ${req.params.name} Deleted`,
        });
      } else {
        res
        .json({
          success: false,
          message: `Data ${req.params.name} Not Found`
        });
      }
    });
  });

module.exports = router;
