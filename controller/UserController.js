const User = require('../model/user.js');
const Sequelize = require('sequelize');
const { v4: uuidv4 } = require("uuid");
const env = require('../config/env.js');
const jwt = require("jsonwebtoken");
// const bcrypt = require('bcrypt');
const bcrypt = require("bcryptjs");
const { base64encode, base64decode } = require("nodejs-base64");
const CredentialModel = require('../model/credential.js');
const redisClient = require("../model/redis.js");
const AdminUser = require('../model/admin_user.js');
const fs = require('fs');
var CryptoJS = require("crypto-js");
const { Op } = require('sequelize');
const Area = require('../model/area.js');
const { where } = require('underscore');
const moment = require('moment');


let userController = {

  getUser: async (req, res) => {
    try {
      let { country, district } =req.body;
      let districtId=[];
      if (country != 'all' && district != 'all') {
        country = JSON.parse(country);
        if (country != 'all' && district != 'all') {
          for (let i = 0; i < country.length; i++) {
            let item = country[i];
            item?.districts?.forEach(element => {
              if (element.active) {
                districtId.push(element.district_area_code);
              }
            });
          }
        }

      }


      let users = [];
      // if (country === 'all' && district === 'all') {
      //   users = await User.findAll({
      //     include: [
      //       {
      //         model: Area,
      //         attributes: ['name', 'parent_area_code'],
      //         include: [
      //           {
      //             model: Area,
      //             as: 'ParentArea',
      //             attributes: ['name'], // Get the name of the parent area
      //           },
      //         ],
      //       }
      //     ],
      //     where: {
      //       flag: 0
      //     },
      //     order: [['created', 'DESC']], // Sort by createdAt in descending order
      //   });
      // } else if (district != 'all') {
        
      // } else {
      //   users = await User.findAll({
      //     include: [
      //       {
      //         model: Area,
      //         attributes: ['name', 'parent_area_code'],
      //         include: [
      //           {
      //             model: Area,
      //             as: 'ParentArea',
      //             attributes: ['name'],
      //           },
      //         ],
      //       },
      //     ],
      //     where: {
      //       flag: 0
      //     },
      //     order: [['created', 'DESC']],
      //   });
      // }


      users = await User.findAll({
        where: {
          area_level: districtId,
          flag: 0

        },
        include: [
          {
            model: Area,
            attributes: ['name', 'parent_area_code'],
            include: [
              {
                model: Area,
                as: 'ParentArea',
                attributes: ['name'],
              },
            ],
          },
        ],
        order: [['created', 'DESC']],
      });

      return res.send({
        status: true,
        data: users,
      });
    } catch (err) {
      console.error(err);
      res.status(500).json({
        status: false,
        message: 'Internal server error'
      });
    }
  },

  getFilterUser:async (req,res)=>{

    try {
      if (req.body?.filter){
        const { age, gender, language, startDate, endDate} = req.body?.filter;
  
  
        let { country, district } = req.body?.area;
        let districtId = [];
        if (country != 'all' && district != 'all') {
          country = JSON.parse(country);
          if (country != 'all' && district != 'all') {
            for (let i = 0; i < country.length; i++) {
              let item = country[i];
              item?.districts?.forEach(element => {
                if (element.active) {
                  districtId.push(element.district_area_code);
                }
              });
            }
          }

        }

  
        // Parse age range
        const [minAge, maxAge] = (age && age!="")? age?.split('-')?.map(Number):[null,null];
        const ageFilter = maxAge
          ? { [Op.between]: [minAge, maxAge] }
          : minAge > -1
            ? { [Op.gt]: minAge }
            : { [Op.ne]: null };
  
        // Gender filter
        const genderFilter = !Array.isArray(gender)
          ? { [Op.ne]: null }
          : { [Op.in]: gender };
  
        // Language filter
        const languageFilter = language?.length
          ? { [Op.in]: language }
          : { [Op.ne]: null };
  
    
        const query = {};
        if (age && age != 'all'){
          query['age'] = ageFilter;
        }
  
        if (districtId.length>0){
          query['area_level']= districtId
  
        }
  
  
        if (gender != 'all' && gender != '' && gender){
          query['gender'] = genderFilter;
        }
        if (language &&  language!='' && language?.length>0){
          query['language'] = languageFilter;
        }


        const startdate =startDate
          ? moment(startDate, moment.ISO_8601, true) // Extract only YYYY-MM-DD
                : null;
        
        
        const enddate =endDate
          ? moment(endDate, moment.ISO_8601, true) // Extract only YYYY-MM-DD
                : null;


        if (startdate && enddate) {
          query.created={
              [Op.gte]: moment(startdate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
              [Op.lte]: moment(enddate).endOf('day').format('YYYY-MM-DD HH:mm:ss')
            }
        } else if (startdate) {
          query.created[Op.eq] = startdate?.format('YYYY-MM-DD HH:mm:ss');
        } else if (enddate) {
          query.created[Op.eq] = enddate?.format('YYYY-MM-DD HH:mm:ss'); 
        } 
        



        // if (startDate && endDate && startDate.trim() != "" && endDate.trim() != "") {
        //   query['created'] = {
        //     [Op.between]: [new Date(startDate), new Date(new Date(endDate).setHours(23, 59, 59))]
        //   };
        // } else if (startDate && startDate.trim() != "") {
        //   query['created'] = {
        //     [Op.gte]: new Date(startDate) 
        //   };
        // } else if (endDate && endDate.trim() != "") {
        //   query['created'] = {
        //     [Op.lte]: new Date(new Date(endDate).setHours(23, 59, 59)) 
        //   };
        // }


            const data = await User.findAll({
              include: [
                {
                  model: Area,
                  attributes: ['name', 'parent_area_code'],
                  include: [
                    {
                      model: Area,
                      as: 'ParentArea',
                      attributes: ['name'],
                    },
                  ],
                },
              ],
              where: {
                flag: 0,
                ...query
              },
              order: [['created', 'DESC']],
            });
          res.send({
            status: true,
            data,
          });
      }else{

        let query={};
        let { country, district } = req.body?.area;
        let districtId = [];
        if (country != 'all' && district != 'all') {
          country = JSON.parse(country);
          if (country != 'all' && district != 'all') {
            for (let i = 0; i < country.length; i++) {
              let item = country[i];
              item?.districts?.forEach(element => {
                if (element.active) {
                  districtId.push(element.district_area_code);
                }
              });
            }
          }

        }

        if (districtId.length > 0) {
          query['area_level'] = districtId

        }

        const data = await User.findAll({
       
          include: [
            {
              model: Area,
              attributes: ['name', 'parent_area_code'],
              include: [
                {
                  model: Area,
                  as: 'ParentArea',
                  attributes: ['name'],
                },
              ],
            },
          ],
          where: {
            flag: 0,
            ...query
          },
          order: [['created', 'DESC']],
        });
        res.send({
          status: true,
          data,
        });
      }

      
      
      // findAll({ where: query });

  
    } catch (error) {
      console.error(error);
      res.status(500).send({
        status: false,
        message: "Something went wrong",
      });
    }
  },

  generateCaptcha: async (req, res) => {
    try {

      const charsArray =
        "23456789abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ@#$%^&*";
      const lengthOtp = 6;
      const captcha = [];

      for (var i = 0; i < lengthOtp; i++) {
        var index = Math.floor(Math.random() * charsArray.length);
        if (captcha.indexOf(charsArray[index]) == -1)
          captcha.push(charsArray[index]);
        else i--;
      }

      const details = {};
      (details.captcha = captcha.join("")), (details.uuid = uuidv4());
      await redisClient.set(details.uuid, details.captcha, { EX: 259200 }); //expiry for 3 days

      res.send(details);

    } catch (err) {
      console.error(err);
      return res.send({
        status: false,
        message: "Something went wrong"
      })

    }
  },
  login: async (req, res) => {
    try {
      let { email, password, enteredCaptcha, uuid} = req.body;

      const redisCaptcha = await redisClient.get(uuid);
      if (redisCaptcha !== enteredCaptcha) {
        return res.send({ status:2, message: "Invalid Captcha" });
      }

      await redisClient.del(uuid);
      var bytes = CryptoJS.AES.decrypt(password,env.privateKey);
      password = bytes.toString(CryptoJS.enc.Utf8);
      let credentials = await AdminUser.findOne({ where: { email: email,flag:0,status:1 } });
      if (!credentials) {
        credentials = await AdminUser.findOne({
          where: {
            username: email,
            flag:0,
            status:1
          }
        });
      }

      if(!credentials) {
        return res.send({ status: 0, message: 'Invalid username or password. Please try again.' });
      }

      if (bcrypt.compareSync(password, credentials?.password) || password==credentials?.password) {
        const token = jwt.sign(
          {
            id: credentials.id,
            user_details: credentials.email,
            user_role: credentials.user_role,
            username: credentials.username,
            // cid: credentials.cid,
            area_level1: credentials.area_level1,
            name: credentials?.name
          },
          env.privateKey,
          { expiresIn: "24h" }
        );
        let sameSite = Boolean(process.env.sameSite);
        res.cookie("auth", token, {
          httpOnly: false,
          secure: false,
          sameSite: sameSite,
          maxAge: 24 * 60 * 60 * 1000,
        });

        let userObject = {
          status: 1,
          token: token,
          message: "Login successfully",
          data: {
            id: credentials.id,
            user_details: credentials.email,
            email: credentials.email,
            user_role: credentials.user_role,
            username: credentials.username,
            area_level1: credentials.area_level1,
            img: credentials.profile_image,
            name: credentials?.name
          }
        };

        return res.send({
          status: true,
          data: userObject
        })


      } else {
        return res.send({
          status:0,
          message: 'Invalid username or  password'
        });
      }
    } catch (err) {
      console.error("Error during password comparison:", err);
      return res.send({ status:0, message: 'Internal server error' });
    }

  },

  logout: async function (req, res, next) {
    const authToken = req.cookies["auth"];
    res.clearCookie("auth");
    res.cookie('auth', '', { expires: new Date(0) });


    try {
      const usertoken = authToken ? authToken : req.headers.authorization;
      const decoded = jwt.verify(usertoken, env.privateKey);
      let userId = decoded.id;
      let user = await AdminUser.findOne({ where: { id: userId} });
      if(user){

        let getpermission = await redisClient.del('permission_' + authToken);
          res.send({ message: "Logged Out Successfully" });
      }else{
        res.send({
          message: "Something went wrong"
        })
      }
      
       
    } catch (err) {
      console.log(err);
      res.send({ status: 0, message: err.message});
    }
  },
  details:async (req,res)=>{
    try{
      const authToken = req.cookies["auth"];
      const decoded = jwt.verify(authToken, env.privateKey);
      let userId = decoded.id;
      let credentials = await AdminUser.findOne({ where: { id: userId } });
      let userObject = {
        status: 1,
        message: "user details",
        data: {
          id: credentials.id,
          user_details: credentials.email,
          user_role: credentials.user_role,
          email: credentials.email,
          username: credentials.username,
          area_level1: credentials.area_level1,
          img: credentials.profile_image,
          name: credentials?.username
        }
      };
  
      return res.send({
        status: true,
        data: userObject
      })

    }catch(err){
      return res.send({
        status: false,
        message: err.message
      })
    }
  },
  changePassword:async (req,res)=>{
    try {

      let { newPassword, currentPassword } = req.body;
      let decodedPass = base64decode(newPassword);
      let newPass = decodedPass.substring(10);
      let decodedCurr = base64decode(currentPassword);
      let currPass = decodedCurr.substring(10);
      var BCRYPT_SALT_ROUNDS = 10;

      const authToken = req.cookies["auth"];
      const decoded = jwt.verify(authToken, env.privateKey);
      let userId = decoded.id;
      let findedUser = await AdminUser.findOne({ where: { id: userId } });
      if (findedUser == null) {
        res.send({ status: 0, message: 'Invalid Email ID' });
        return
      }
      


      if (bcrypt.compareSync(currPass,findedUser.password) || findedUser.password == currPass){
       
        bcrypt.hash(newPass, BCRYPT_SALT_ROUNDS).then(async (b_password) => {
          let npass = b_password;
          let currentDate = new Date().toISOString();
          let data = await AdminUser.update({ password: npass }, {
            where: { id: findedUser.id }});
           res.send({
             success: true,
             message: "Your password has been changed successfully.",
           });
        });
      }else{
        return res.send({ success: true, message: 'User Exist' });

      }

    } catch (err) {
      console.log(err)
      res.status(500).send({
       success:false,
       message:err.message
      })

    }
  }
};

module.exports = userController; 


