const Area = require('../model/area');
const Classification = require('../model/classification');
const { Sequelize } = require('sequelize');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const env = require("../config/env");


const db=require('../model/db');

let languageController = {

    exportData: async function (req, res) {
        let data = {};
        let dataType = Number(req.params.dataType)
        let collection;
        switch (dataType) {
            case 1:
                collection = Area;
                languageController.translationAreaCSV(req, res);
                break;

            case 2:
                collection = Classification;
                languageController.translationClassificationCSV(req,res);
            default:
            // code block
        }
    },


    translationAreaCSV: async function (req, res) {
        let tempDataArr = [];
        try {
            let tempArea = await Area.findAll({
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('name')), 'en'],
                    ['name_nl', 'nl'], 
                    ['name_fr', 'fr'],
                    ['name_es', 'es'],
                ],
            });

    
            tempArea.forEach(area => {
                let tempjson = {};
                tempjson.en = area['dataValues'].en;
                tempjson.nl = area['dataValues'].nl; 
                tempjson.fr = area['dataValues'].fr;
                tempjson.es = area['dataValues'].es;
    
                tempDataArr.push(tempjson);
            });
    
            const csvWriter = createCsvWriter({
                path: `${env.logFilePath}MyChildhelpline_Geographical_area_language_template_with_data.csv`,
                header: [
                    { id: 'en', title: 'English' },
                    { id: 'nl', title: 'Dutch' },
                    { id: 'fr', title: 'French' },
                    { id: 'es', title: 'Spanish' },
                ],
            });
    
            await csvWriter.writeRecords(tempDataArr);
    
            // fs.writeFileSync(
            //     `${env.logFilePath}MyChildhelpline_Geographical_area_language_template_with_data.csv`,
            //     '\ufeff' + fs.readFileSync(`${env.logFilePath}MyChildhelpline_Geographical_area_language_template_with_data.csv`),
            //     'utf8'
            // );
    
            console.log('File downloaded successfully');
    
            res.send({
                success: true,
                filepath: 'MyChildhelpline_Geographical_area_language_template_with_data.csv',
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json(err);
        }
    },
    
    
    translationClassificationCSV: async function (req, res) {
        let tempDataArr = [];
        try {
            let tempClassification = await Classification.findAll({
                attributes: [
                    [Sequelize.fn('DISTINCT', Sequelize.col('classification_name')), 'en'],
                    ['classification_name_nl', 'nl'],
                    ['classification_name_fr', 'fr'],
                    ['classification_name_es', 'es'],
                ],
            });
    
            tempClassification.forEach(classification => {
                let tempjson = {};
                tempjson.en = classification['dataValues'].en;
                tempjson.nl = classification['dataValues'].nl || '';
                tempjson.fr = classification['dataValues'].fr || '';
                tempjson.es = classification['dataValues'].es || '';
    
                tempDataArr.push(tempjson);
            });
    
            const csvWriter = createCsvWriter({
                path: `${env.logFilePath}MyChildhelpline_Classification_language_template_with_data.csv`,
                header: [
                    { id: 'en', title: 'English' },
                    { id: 'nl', title: 'Dutch' },
                    { id: 'fr', title: 'French' },
                    { id: 'es', title: 'Spanish' },
                ],
            });
    
            await csvWriter.writeRecords(tempDataArr);
    
            // fs.writeFileSync(
            //     `${env.logFilePath}MyChildhelpline_Classification_language_template_with_data.csv`,
            //     '\ufeff' + fs.readFileSync(`${env.logFilePath}MyChildhelpline_Classification_language_template_with_data.csv`),
            //     'utf8'
            // );
    
            console.log('File downloaded successfully');
    
            res.send({
                success: true,
                filepath: 'MyChildhelpline_Classification_language_template_with_data.csv',
            });
        } catch (err) {
            console.error(err);
            return res.status(500).json(err);
        }
    },

};

module.exports = languageController; 
