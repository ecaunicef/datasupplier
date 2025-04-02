const MoodMapper = require('../model/mood_mapper');
const { Op } = require('sequelize');


let moodMapperController = {

    getMoodMapperList: async function (req, res) {
        try {

            let queryData = `
            SELECT 
                mood_mapper.id,
                mood_mapper.mood,
                mood_mapper.description,
                mood_mapper.assigned_modules,
                mood_mapper.created,
                mood_mapper.updated
            FROM mood_mapper
        `;

            let data = await MoodMapper.sequelize.query(queryData, {
                type: MoodMapper.sequelize.QueryTypes.SELECT
            });
            
            res.status(200).json({status: true, data: data});

        } catch (error) {
            // console.error(error.message);
            res.status(200).json({status: false, message: error.message});

        }
    },


    getMoodForApp: async (req, res) => {
        try {
            const getData = await MoodMapper.findAll({
                raw: true
            });

            res.send({
                status: true,
                data: getData
            });
        } catch (error) {
            res.json({status: false, message: error.message});
        }
    }
};

module.exports = moodMapperController; 
