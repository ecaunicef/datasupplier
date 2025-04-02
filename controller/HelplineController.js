const Area = require('../model/area.js');
const Classification = require('../model/classification.js');
const Helpline = require('../model/helpline.js');

let helplineController = {

    getHelpline: async (req, res) => {

        try {
            const allHelpline = await Helpline.findAll({
                include: [
                    {
                        model: Area,
                        as: 'area',
                        foreignKey: 'area_level1', 
                        required: true 
                    },
                    {
                        model: Classification,
                        as: 'classification',
                        foreignKey: 'classification_id', 
                        attributes: ['classification_name', 'classification_type'], 
                        required: false, 
                    },
                ],
                order: [
                    ["created", 'DESC']
                ]
            });

            if (allHelpline.length === 0) {
                return res.send({ message: 'No helpline found' });
            }

            const helplineWithAreaDetails = await Promise.all(allHelpline.map(async (helpline) => {
                const area = await Area.findOne({
                    where: { area_code: helpline.area_level1 }
                });

                if (area) {
                    const parentArea = area.parent_area_code
                        ? await Area.findOne({ where: { area_code: area.parent_area_code } })
                        : null;

                    helpline.dataValues.areaDetail = {
                        area: area,
                        parentArea: parentArea ? parentArea : null
                    };
                } else {
                    helpline.dataValues.areaDetail = null;
                }

                return helpline;
            }));

            res.send({
                data: helplineWithAreaDetails,
                success: true
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'An error occurred while fetching helplines', success: false });
        }

    },

    getFilterData:async(req, res, next)=>{
        try {
            const userData = JSON.parse(req.user.area_level1)

            const { area_level1, category, emergency_service } = req.body;

            let country;
            if(area_level1){
                country = [area_level1]
            } else{
                country = userData.map(item => item.country_area_code)
            }

            let replacements = { country };

            let queryData = `
                SELECT 
                    helplinenumber.id,
                    helplinenumber.helplinenumber,
                    
                    helplinenumber.emergency_service,
                    helplinenumber.hotline,
                    helplinenumber.organization,
                    helplinenumber.website,
                    helplinenumber.add1,
                    helplinenumber.tel1,
                    helplinenumber.tel2,
                    helplinenumber.tel3,
                    helplinenumber.email,
                    helplinenumber.geolocation,
                    helplinenumber.subcategory,
                    helplinenumber.image,
                    helplinenumber.flag,
                    helplinenumber.created,
                    helplinenumber.updated,
                    helplinenumber.deleted,
                    helplinenumber.area_level1,
                    helplinenumber.classification_id,
                    area.name as place,
                    area.area_code,
                    classification.classification_name as category
                FROM helplinenumber 
                JOIN area
                ON helplinenumber.area_level1 = area.area_code
                JOIN classification
                ON helplinenumber.classification_id =classification.id
                WHERE area_level1 IN (:country)
                ORDER BY helplinenumber.created DESC
            `;

            let data = await Helpline.sequelize.query(queryData, {
                type: Helpline.sequelize.QueryTypes.SELECT,
                replacements: replacements
            });

            if(category){
                data = data?.filter((item)=> {
                    return(item.classification_id === Number(category))
                })
            };

            if(emergency_service){
                data = data?.filter((item)=> {
                    return(item.emergency_service === emergency_service)
                })
            };

            res.send({ status: true, data: data});
        }
        catch (error) {
            console.error(error);
            res.status(500).json({status: false, message: 'Internal Server Error', error: error.message });
        }


    },






    //  ================================================== mobile apis ==============================================

    getHelplineForMobile: async (req, res) => {
        try {
            const allHelpline = await Helpline.findAll({});

            if (allHelpline.length === 0) {
                return res.send({ message: 'No helpline found' });
            }
            res.send(allHelpline);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
    },

    getHelplineByClassification: async (req, res) => {
        try {
            const category = req.body.category;
            const area_level1 = req.body.country_id
            const allHelpline = await Helpline.findAll({
                where:{
                    classification_id: category,
                    area_level1: area_level1
                },
                include: [
                    {
                        model: Classification,
                        as: 'classification',
                        foreignKey: 'classification_id', 
                        attributes: ['classification_name', 'classification_name_fr', 'classification_name_es', 'classification_name_nl', 'classification_type'], 
                        required: false, 
                    },
                ]
            });

            if (allHelpline.length === 0) {
                return res.status(200).json({ message: 'No helpline found' });
            }
            res.send(allHelpline);
        } catch (err) {
            console.error(err);
            res.status(500).json({ message: 'Internal Server Error', error: err.message });
        }
    },

};

module.exports = helplineController; 
