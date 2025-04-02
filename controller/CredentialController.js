const CredentialModel=require('../model/credential.js');
const Country = require('../model/country');
const Sequelize = require('sequelize');
const { Op } = require('sequelize');
const AdminUser = require('../model/admin_user.js');

let credentialController={
    getAllCredentials:async (req,res)=>{
        try{
            let userDetails = req.user;
            // let credentials = [];

            // console.log(userDetails,"9999");
            // let contryList =userDetails?.area_level1;
            // console.log(contryList,"00000");

            let credentials = await AdminUser.findAll({
                where: {
                    id: {
                        [Op.ne]: userDetails?.id
                    },
                    flag:{
                        [Op.eq]:0
                    }
                   
                   
                }
            });          
            return res.send({
                status:true,
                data:credentials
            })
           
        }catch(err){
            console.log(err);
            return res.send({
                status:false,
                message: "Something went wrong"
            })
        }
    },
    checkToken: async (req, res) => {
        try {

            const findedUser = await AdminUser.findOne({ where:{token: req.body.token, status: 1 }});

            if (findedUser) {
                res.send({ status: 1 });
            } else {
                res.send({ status: 0 });
            }
        } catch (error) {
            console.log(error)
            return res.send({
                status:false,
                message:"Something went wrong"
            })

        }

    }
}

module.exports = credentialController; 