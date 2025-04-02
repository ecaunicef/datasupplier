const MoodTracker = require('../model/mood_tracker.js');
const User = require('../model/user.js');
const { Op } = require('sequelize');


let moodTracker = {

    getMoodTracker: async (req, res) => {
        try {
            let { district, country, startDate, endDate, ageGroup } = req.body;


            // let { country, district } = req.body;
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


            const dateCondition = {
                created: {
                    [Op.between]: [new Date(startDate), new Date(endDate + " 23:59:59")],
                },
                ...(districtId.length > 0 && { '$user.area_level$': { [Op.in]: districtId } }),
            };


            const [minAge, maxAge] = (ageGroup && ageGroup != "") ? ageGroup?.split('-')?.map(Number) : [null, null];
            const ageFilter = maxAge
                ? { [Op.between]: [minAge, maxAge] }
                : minAge > -1
                    ? { [Op.gt]: minAge }
                    : { [Op.ne]: null };

            if (ageGroup && ageGroup != 'all') {
                dateCondition['$user.age$'] = ageFilter;
            }



            const allMoodTracker = await MoodTracker.findAll(
                {
                    include: [{
                        model: User,
                        attributes: ['id', 'area_level', 'age', 'gender'],
                    }],
                    where: dateCondition,

                }
            );

            if (allMoodTracker.length === 0) {
                return res.send({ status: true, message: 'No moodtracker found' });
            }


            const formattedData = allMoodTracker?.map((tracker) => ({
                id: tracker.id,
                name: tracker.name,
                description: tracker.description,
                uid: tracker.id_mobileappuser,
                userName: tracker['user.name'] || '',
                // country: tracker['user.place'] || '',
                created: tracker.created,
                gender: tracker['user.gender'] || '',
                district: tracker['user.district'] || '',
            }));

            res.send({ status: true, data: formattedData });
        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'Internal server error' });
        }


    },
    getAllMoodTracker: async (req, res) => {

        try {
            const { startDate, endDate, name, areaLevel2 } = req.body;

            const start = new Date(startDate);

            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            const whereConditions = {
                name: name,
                created: {
                    [Op.between]: [start, end]
                }
            };

            const includeUser = Array.isArray(areaLevel2) && areaLevel2?.length > 0 ?
                [{
                    model: User,
                    where: {
                        area_level: {
                            [Op.in]: areaLevel2
                        }
                    },
                    attributes: ['name', 'area_level', 'id'],
                }] : [];

            const allMoodTracker = await MoodTracker.findAll({
                where: whereConditions,
                include: includeUser,
                raw: true
            });

            res.send({
                status: true,
                data: allMoodTracker,
                count: allMoodTracker?.length
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ status: false, message: 'An error occurred', error: error.message });
        }
    }

};

module.exports = moodTracker; 
