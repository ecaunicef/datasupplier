const Classification = require('../model/classification')
const fs = require("fs");
const env = require("../config/env");
const sequelize = require('../model/db');
const path = env.constantFilePath + "classification.json";

// console.log("qq", env)
const getAllClassification = async (req, res) => {
    try {
        const condition = { classification_type: req.body.classificationType ?? null };

        let data = await Classification.findAll({
            where: condition
        });

        if (data?.length == 0) {
            return res.status(200).json({ status: false, message: "No Data Found" });
        };

        return res.status(200).json({ status: true, data: data })
    } catch (error) {
        return res.status(500).json({ message: 'Error fetching', error: error.message });
    }
};



const getClassificationType = async (req, res)=> {
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
        return res.send({ status: false, message: "hi" })
    }
};

const getClassifications = async (req, res) => {
    try {
        const query = `
            SELECT 
                id, 
                classification_name, 
                classification_name_nl, 
                classification_name_fr, 
                classification_name_es, 
                classification_type, 
                created, 
                updated, 
                deleted
            FROM classification
        `;

        const data = await sequelize.query(query, {
            type: sequelize.QueryTypes.SELECT, 
        });

        const uniqueClassifications = [];
        const seenNames = new Set();

        for (const item of data) {
            if (!seenNames.has(item.classification_name)) {
                seenNames.add(item.classification_name);
                uniqueClassifications.push(item);
            }
        }

        return res.send({
            status: true,
            data: uniqueClassifications,
        });
    } catch (err) {
        return res.send({
            status: false,
            message: "Something went wrong while fetching the classification list.",
        });
    }
};




const getListByType = async (req, res) => {
    try {
        const condition = { classification_type: req.body.classificationType ?? null };

        let data = await Classification.findAll({
            where: condition
        });

        if (data?.length == 0) {
            return res.status(200).json({ status: false, message: "No Data Found" });
        };

        const updatedData = data.map(classification => {
            const { classification_name,classification_name_nl, classification_name_fr, classification_name_es } = classification.dataValues;

            return {
                ...classification.dataValues,
                classification_name_nl: classification_name_nl === null ? '#' +classification_name : classification_name_nl,
                classification_name_fr: classification_name_fr === null ? '#' +classification_name : classification_name_fr,
                classification_name_es: classification_name_es === null ? '#' +classification_name : classification_name_es
            };
        });

        return res.status(200).json({ status: true, data: updatedData })

    } catch (err) {
        return res.status(500).json({ status: false, message: "Something went wrong"})
}

};

module.exports = { getAllClassification, getClassificationType, getClassifications, getListByType };
