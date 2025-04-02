const Feedback = require("../model/feedback");
const Area = require('../model/area.js');
const User = require('../model/user.js');

const feedbackController = {
  getAll: async (req, res) => {
    try {


      let { country, district } = req.body;

      let districtId = [];
      if (country != 'all' && district != 'all') {
        country = JSON.parse(country);
        if (country != 'all' && district != 'all') {
          for (let i = 0; i < country.length; i++) {
            let item = country[i];
            item?.districts?.forEach(element => {
              if(element.active){
                districtId.push(element.district_area_code);
              }
            });
          }
        }

      }



      const geoGraphicalDetails = [
        {
          model: User,
          attributes: ['area_level', 'age', 'gender'],
          where: {
            area_level: districtId,
          },
          include: [
            {
              model: Area,
              attributes: ['name', 'parent_area_code'],
              include: [
                {
                  model: Area,
                  as: 'ParentArea',
                  attributes: ['name'],
                },
              ],
            },
          ],
        },
      ];

      const feedback = await Feedback.findAll({
        include: geoGraphicalDetails,
        order: [['created', 'DESC']],
        where: {
          flag: 0
        }
      });
      return res.status(200).json({
        data: feedback,
        success: true,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Something went wrong",
        error: error.message,
        success: false,
      });
    }
  },
};

module.exports = feedbackController;
