const { Sequelize, Op, fn, col, QueryTypes } = require("sequelize");
const User = require("../model/user.js");
const Feedback = require("../model/feedback.js");
const Blog = require("../model/blog.js");
const Counselling = require("../model/counselling.js");
const sequelize = require("../model/db.js");

const moment = require('moment')
const generalController = {
  getCount: async (req, res) => {
    try {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      // if(req.body.country == "all") req.body.country = ''
      // if(req.body.district == "all") req.body.district = ''

      let { country, district } = req.body;
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

      let whereConditions = {
        ...(districtId.length > 0 && { area_level: { [Op.in]: districtId } }),
      };

      let whereConditionForCounselling = {
        ...(districtId.length > 0 && { '$user.area_level$': { [Op.in]: districtId } }),
      };

    const totalUsers = await User.count({
      where:{
        flag:0,
        ...whereConditions
      } ,
    });

      const usersLast30Days = await User.count({
        where: {
          created: {
            [Op.gte]: thirtyDaysAgo,
          },
          ...whereConditions,
        },
      });

      let query = {
        include: [{
          model: User,
          attributes: ['id','area_level'],
        }],
        where: {
            flag: 0,
          id_mobileappuser: { [Op.ne]: null },
          ...whereConditionForCounselling
        }

      };

      const totalFeedbacks = await Feedback.count(query);


      const broadcasts = await Blog.count();



      // const totalCounsellings = await Counselling.count();

      const totalCounsellings = await Counselling.count({
        include: [{
          model: User,
          attributes: ['id','area_level'],
        }],
        where:whereConditionForCounselling,
      });


      const closedCounsellings = await Counselling.count({
        include: [{
          model: User,
          attributes: ['id', 'area_level'],
        }],
        where: {
          updatedAt: { [Op.gte]: thirtyDaysAgo },
          current_status: 0,
          ...whereConditionForCounselling
        },
      });

      const openCounsellings = await Counselling.count({
        include: [{
          model: User,
          attributes: ['id', 'area_level'],
        }],
        where: {
          current_status: 1,
          ...whereConditionForCounselling
        },
      });

      // closed counselling by counselling_given to child
      const counselling_given_children = await Counselling.count({
        include: [{
          model: User,
          attributes: ['id', 'area_level'],
        }],
        where: {
          current_status: 0,
          counselling_given: "child",
          ...whereConditionForCounselling
        },
      });

      const counselling_given_all = await Counselling.count({
        include: [{
          model: User,
          attributes: ['id', 'area_level'],
        }],
        where: {
          current_status: 0,
          counselling_given: {
              [Op.not]: null,
          },
          ...whereConditionForCounselling
        },
      });

      const turnOverTime = await Counselling.findOne({
        attributes: [
          [fn('ROUND', fn('AVG', fn('ABS', fn('DATEDIFF', col('updatedAt'), col('createdAt')))), 1), 'average_days']
        ],
        where: {
          updatedAt: { [Op.gte]: thirtyDaysAgo, [Op.ne]: null },
          current_status: 0,
          ...whereConditionForCounselling
        },
        group: [],
        include: [
          {
            model: User, // Assuming the model for the User table is User            
            attributes: [] // Don't include User fields in the result (optional)
          }
        ]
      });

      // console.log("123", turnOverTime.dataValues.average_days, Math.round(turnOverTime.dataValues.average_days))

      const countObj = {
        totalUsers: totalUsers,
        totalUsersLast30Days: usersLast30Days,
        totalFeedbacks: totalFeedbacks,
        broadcasts: broadcasts,
        totalCounsellings: totalCounsellings,
        closedCounsellings: closedCounsellings,
        openCounsellings: openCounsellings,
        turnOverTime: (turnOverTime.dataValues.average_days == null) ? '-' : Math.round(turnOverTime.dataValues.average_days),
        counsellingGivenChildren: counselling_given_children,
        counsellingGivenAll: counselling_given_all
      };

      res.status(200).json({ data: countObj, success: true });
    } catch (err) {
      console.log(err);
      res.status(500).json({ message: "Internal Server Error" });
    }
  },

  getUserChartData: async (req, res) => {
    try {
      const groupBy = req.body.groupBy || "gender";
      const startdate = req.body.start
        ? moment(req.body.start, moment.ISO_8601, true) // Extract only YYYY-MM-DD
        : null;


      const endDate = req.body.end
        ? moment(req.body.end, moment.ISO_8601, true) // Extract only YYYY-MM-DD
        : null;
  

      
      let { country, district } = req.body;
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

      const whereConditions = {
        created:{},
        ...(districtId.length > 0 && { area_level: { [Op.in]: districtId } }),
      };

    

      if (startdate && endDate) {
          whereConditions.created={
            [Op.gte]: moment(startdate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            [Op.lte]: moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')
          }
      } else if (startdate) {
        whereConditions.created[Op.eq] = startdate?.format('YYYY-MM-DD HH:mm:ss');
      } else if (endDate) {
        whereConditions.created[Op.eq] = endDate?.format('YYYY-MM-DD HH:mm:ss'); 
      } 


      

    
      const [minAge, maxAge] = (groupBy && groupBy != "") ? groupBy?.split('-')?.map(Number) : [null, null];
      const ageFilter = maxAge
        ? { [Op.between]: [minAge, maxAge] }
        : minAge > -1
          ? { [Op.gt]: minAge }
          : { [Op.ne]: null };

      if (groupBy && groupBy != 'all') {
        whereConditions['age'] = ageFilter;
      }


     let users = await User.findAll({
        attributes: ["age", "gender", "created"],
       where:{
        flag:0,
        ...whereConditions
       } 
      });


      

        const ageRanges = {
          "Under 5 years": { male: 0, female: 0, other: 0 },
          "5-9 years": { male: 0, female: 0, other: 0 },
          "10-14 years": { male: 0, female: 0, other: 0 },
          "15-17 years": { male: 0, female: 0, other: 0 },
          "Above 18 years": { male: 0, female: 0, other: 0 },
        };

        users?.forEach(({ age, gender }) => {
          if (age >= 0 && age <= 4) {
            if (gender === "Female") ageRanges["Under 5 years"]["female"]++;
            else if (gender === "Male") ageRanges["Under 5 years"]["male"]++;
            else ageRanges["Under 5 years"]["other"]++;
          } else if (age >= 5 && age <= 9) {
            if (gender === "Female") ageRanges["5-9 years"]["female"]++;
            else if (gender === "Male") ageRanges["5-9 years"]["male"]++;
            else ageRanges["5-9 years"]["other"]++;
          } else if (age >= 10 && age <= 14) {
            if (gender === "Female") ageRanges["10-14 years"]["female"]++;
            else if (gender === "Male") ageRanges["10-14 years"]["male"]++;
            else ageRanges["10-14 years"]["other"]++;
          } else if (age >= 15 && age <= 17) {
            if (gender === "Female") ageRanges["15-17 years"]["female"]++;
            else if (gender === "Male") ageRanges["15-17 years"]["male"]++;
            else ageRanges["15-17 years"]["other"]++;
          }else {
            if (gender === "Female") ageRanges["Above 18 years"]["female"]++;
            else if (gender === "Male") ageRanges["Above 18 years"]["male"]++;
            else ageRanges["Above 18 years"]["other"]++;
          }
        });

      const nonZeroRanges = Object.entries(ageRanges)
        .filter(([key, value]) => value.male !== 0 &&  value.female !== 0 && value.other !== 0)
        .reduce((acc, [key, value]) => {
          acc[key] = value;
          return acc;
        }, {});

      return res.status(200).json({ data: ageRanges, success: true });
  
      res.status(400).json({ error: "Invalid groupBy parameter." });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "An error occurred while fetching user stats." });
    }
  },

  getCounsellingChartData: async (req, res) => {

    try {
      const groupBy = req.body.groupBy || "gender";
      const startdate = req.body.start ? moment(req.body.start, moment.ISO_8601, true) : null;
      const endDate = req.body.end ? moment(req.body.end, moment.ISO_8601, true) : null;
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      let { country, district } = req.body;
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


      const whereConditions = {
        createdAt: {},
        ...(districtId.length > 0 && { '$user.area_level$': { [Op.in]: districtId } }),
      };

    



      // if (startdate && endDate) {
      //   whereConditions.createdAt[Op.between] = [startdate, endDate];
      // } else if (startdate) {
      //   whereConditions.createdAt[Op.eq] = startdate;
      // } else if (endDate) {
      //   whereConditions.createdAt[Op.eq] = endDate;
      // }

      if (startdate && endDate) {
        whereConditions.createdAt = {
          [Op.gte]: moment(startdate).startOf('day').format('YYYY-MM-DD HH:mm:ss'),
          [Op.lte]: moment(endDate).endOf('day').format('YYYY-MM-DD HH:mm:ss')
        }
      } else if (startdate) {
        whereConditions.createdAt[Op.eq] = startdate?.format('YYYY-MM-DD HH:mm:ss');
      } else if (endDate) {
        whereConditions.createdAt[Op.eq] = endDate?.format('YYYY-MM-DD HH:mm:ss');
      } 


  
      const [minAge, maxAge] = (groupBy && groupBy != "") ? groupBy?.split('-')?.map(Number) : [null, null];
      const ageFilter = maxAge
        ? { [Op.between]: [minAge, maxAge] }
        : minAge > -1
          ? { [Op.gt]: minAge }
          : { [Op.ne]: null };

      if (groupBy && groupBy != 'all') {
        whereConditions['$user.age$'] = ageFilter;
      }


     




      // const place = req.body.country?.trim() === 'all' ? null : req.body.country?.trim();
      // const district = req.body.district?.trim() === 'all' ? null : req.body.district?.trim();
      
      // const whereConditions = {};
    
      // if (place) whereConditions['$user.place$'] = place;
      // if (district) whereConditions['$user.district$'] = district;
  
      // Handle createdAt conditions dynamically
      // if (startdate && endDate) {
      //   whereConditions.createdAt = { [Op.between]: [startdate, endDate] };
      // } else if (startdate) {
      //   whereConditions.createdAt = { [Op.gte]: startdate };
      // } else if (endDate) {
      //   whereConditions.createdAt = { [Op.lte]: endDate };
      // } else {
      //   whereConditions.createdAt = { [Op.gte]: sevenDaysAgo }; // Default: last 7 days
      // }
  
      // Group by age
    

      const users = await Counselling.findAll({
        include: [{
          model: User,
          attributes: ['id','area_level','age','gender'], 
        }],
        where: whereConditions,
      });


      let obj = {};
      const ageRanges = () => ({
        "Under 5 years": 0,
        "5-9 years": 0,
        "10-14 years": 0,
        "15-17 years": 0,
        "Above 18 years": 0,
      });

      users.forEach(function (item) {
        let appointmentData = JSON.parse(item.appointment_reason);
        if (item?.user?.age >= 0 && item?.user?.age <= 4) {
          appointmentData.forEach((ele) => {
            if (!obj[ele]) {
              obj[ele] = ageRanges();
            }
            obj[ele]['Under 5 years']++;
          });
        } else if (item?.user?.age >= 5 && item?.user?.age <= 9) {
          appointmentData.forEach((ele) => {
            if (!obj[ele]) {
              obj[ele] = ageRanges();
            }
            obj[ele]['5-9 years']++;
          });
        } else if (item?.user?.age >= 10 && item?.user?.age <= 14) {
          appointmentData.forEach((ele) => {
            if (!obj[ele]) {
              obj[ele] = ageRanges();
            }
            obj[ele]['10-14 years']++;
          });
        } else if (item?.user?.age >= 15 && item?.user?.age <= 17) {
          appointmentData?.forEach((ele) => {
            if (!obj[ele]) {
              obj[ele] = ageRanges();
            }
            obj[ele]['15-17 years']++;
          });
        } else {
          appointmentData?.forEach((ele) => {
            if (!obj[ele]) {
              obj[ele] = ageRanges();
            }
            obj[ele]['Above 18 years']++;
          });
        }
      });

    
      return res.status(200).json({ data: obj, success: true });
    } 
    catch (error) {
      console.error("Error fetching user stats:", error);
      res.status(500).json({ error: "An error occurred while fetching user stats." });
    }
  }
  
};

module.exports = generalController;
