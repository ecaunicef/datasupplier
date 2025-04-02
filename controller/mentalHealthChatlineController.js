const Chatline = require('../model/mental_health_chatline');
const sequelize = require('../model/db');

const mentalHealthController = {
    getChatline: async (req, res) => {
        try {

            let queryData = `
            SELECT 
                mental_health_chatline.id AS id, 
                mental_health_chatline.area_level1 AS area_level1, 
                mental_health_chatline.w_link AS w_link,
                mental_health_chatline.status AS status,
                mental_health_chatline.created AS createdAt,
                mental_health_chatline.updated AS updatedAt,
                area.name AS area_name 
            FROM mental_health_chatline 
            LEFT JOIN area ON area.area_code = mental_health_chatline.area_level1
        `;

            let data = await Chatline.sequelize.query(queryData, {
                type: Chatline.sequelize.QueryTypes.SELECT
            });

            return res.send({ status: true, data: data });
        } catch (err) {
            return res.send({
                status: false,
                message: err.message
            })
        }
    },

    getChatLinkByCountry: async (req, res) => {
        try {
            const area_code = req.body.country_code
            const getChatline = await Chatline.findOne({
                where: { area_level1: area_code, status: 1 }
                
            });
            return res.send({ status: true, data: getChatline });
        } catch (error) {
            return res.send({
                status: false,
                message: error.message
            })
        }
    }
}


module.exports = mentalHealthController;