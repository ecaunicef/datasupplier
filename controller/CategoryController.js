const Category = require('../model/category');
const fs = require("fs");
const env = require("../config/env");
const path = env.constantFilePath + "/classification.json";

let categoryController = {

    getCategory: async function (req, res) {
        try {
            const condition = { type: req.body.type ?? null};

            let data = await Category.findAll({
                where: condition
            });

            if (data?.length == 0) {
                return res.status(200).json({ status: false, message: "No Data Found" });
            };

            return res.status(200).json({ status: true, data: data })
        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: error.message })
        }

    },

    getAllCategory:async function(req, res){
        try{
            let data = await Category.findAll({});
            if (data?.length == 0) {
                return res.status(200).json({ status: false, message: "No Data Found" });
            };
            return res.status(200).json({ status: true, data: data })

        }catch(err){
            console.log(err);
            return res.status(500).json({ status: false, message: err.message })
        }

    },

    getCategoryType: async function (req, res) {
        try {
            let data = fs.readFileSync(path, 'utf8');
            if (data) {
                return res.send({
                    status: 200,
                    data: data
                });
            } else {
                return res.send({
                    status: 500,
                    message: "File reading error"
                });
            }

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: error.message })
        }
    },


    //  ======================================== mobile apis ===================================

    getCategoryForMobile: async function (req, res) {
        try {
            let data = await Category.findAll({
                attributes: ['id', 'name']
            });

            if (data?.length == 0) {
                return res.status(400).json({ status: false, message: "No Data Found" });
            };
            return res.status(200).json(data)
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });

        }

    }
};

module.exports = categoryController; 
