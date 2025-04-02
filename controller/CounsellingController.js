const Counselling = require('../model/counselling');

let counsellingController = {

    getAllCounselling: async function (req, res) {
        try {
            let queryData = `
            SELECT 
                counselling.id, 
                counselling.comment, 
                counselling.country, 
                counselling.first_name,
                counselling.second_name,
                counselling.mobile_number,
                counselling.message,
                counselling.appointment_reason, 
                counselling.appointment_time, 
                counselling.appointment_date, 
                counselling.uid, 
                counselling.current_status, 
                counselling.flag, 
                counselling.createdAt,
                counselling.updatedAt
            FROM counselling
        `;

            let data = await Counselling.sequelize.query(queryData, {
                type: Counselling.sequelize.QueryTypes.SELECT
            });

            return res.status(200).json(data)

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: error.message })
        }



    },
    getCounselling: async function (req, res) {
        try {
            let allData = await Counselling.findAll();

            if (allData?.length == 0) {
                return res.status(400).json({ status: false, message: "No Data Found" })
            }

            return res.status(200).json({ status: true, data: allData })

        } catch (error) {
            console.error(error);
            return res.status(500).json({ status: false, message: error.message })
        }



    },

    getUserBasedCounselling: async function (req, res) {
        try {
            const {first_name, last_name, age_group, gender, appointment_date, area_level2 } = req.body;
    
            let whereClauses = [];
            let replacements = {};
    
            if (area_level2 && Array.isArray(area_level2) && area_level2.length > 0) {
                whereClauses.push('user.area_level IN (:area_level2)');
                replacements.area_level2 = area_level2;
            }
    
            let whereString = '';
            if (whereClauses.length > 0) {
                whereString = 'WHERE ' + whereClauses.join(' AND ');
            }
    
            let queryData = `
                SELECT 
                    counselling.id, 
                    counselling.first_name,
                    counselling.second_name,
                    counselling.mobile_number,
                    counselling.appointment_reason, 
                    counselling.message,
                    counselling.appointment_date, 
                    counselling.comment, 
                    counselling.current_status, 
                    counselling.flag, 
                    counselling.createdAt, 
                    counselling.updatedAt, 
                    counselling.id_mobileappuser,
                    counselling.counselling_given,
                    user.area_level,
                    user.gender,
                    user.language,
                    user.age,
                    area.name AS country,
                    area.parent_area_code AS parent_area_code,
                    parent_area.name AS parent_area_name 
                FROM counselling
                INNER JOIN user ON counselling.id_mobileappuser = user.id
                INNER JOIN area ON user.area_level = area.area_code
                LEFT JOIN area AS parent_area ON area.parent_area_code = parent_area.area_code
                ${whereString}
                ORDER BY counselling.updatedAt DESC
            `;
    
            let data = await Counselling.sequelize.query(queryData, {
                type: Counselling.sequelize.QueryTypes.SELECT,
                replacements: replacements
            });
    
            if (first_name) {
                data = data.filter((item) =>
                    item.first_name.toLowerCase().includes(first_name.toLowerCase())
                );
            }
    
            if (last_name) {
                data = data.filter((item) =>
                    item.second_name.toLowerCase().includes(last_name.toLowerCase())
                );
            }
    
            if (age_group && age_group !== 'all') {
                const [minAge, maxAge] = age_group.split('-').map((age) => parseInt(age, 10));
                if (maxAge) {
                    data = data.filter((item) => {
                        const itemAge = parseInt(item.age, 10);
                        return itemAge >= minAge && itemAge <= maxAge;
                    });
                } else {
                    data = data.filter((item) => {
                        const itemAge = parseInt(item.age, 10);
                        return itemAge >= minAge;
                    });
                }
            }
    
            if (gender && gender.length > 0) {
                data = data.filter((item) =>
                    gender.map((g) => g.toLowerCase()).includes(item.gender.toLowerCase())
                );
            }
    
            if (appointment_date?.start && appointment_date?.end) {
                const startDate = new Date(appointment_date.start);
                const endDate = new Date(appointment_date.end);
                
                data = data.filter((item) => {
                    let appointmentDate;
                    if (typeof item.appointment_date === 'string') {
                        const dateParts = item.appointment_date.split(/[-\s]/);
                        
                        if (dateParts[0].length === 2) {
                            appointmentDate = new Date(
                                parseInt(dateParts[2]),
                                parseInt(dateParts[1]) - 1,
                                parseInt(dateParts[0])
                            );
                        } 
                        // Handle YYYY-MM-DD format
                        else {
                            appointmentDate = new Date(item.appointment_date);
                        }
                    } else {
                        appointmentDate = new Date(item.appointment_date);
                    }
    
                    // Reset time parts for comparison
                    const compareDate = new Date(appointmentDate.setHours(0, 0, 0, 0));
                    const compareStart = new Date(startDate.setHours(0, 0, 0, 0));
                    const compareEnd = new Date(endDate.setHours(0, 0, 0, 0));
    
                    return compareDate >= compareStart && compareDate <= compareEnd;
                });
            }
    
            res.status(200).json({ status: true, data: data });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    }
    
    

};

module.exports = counsellingController; 
