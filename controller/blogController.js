const Blog = require('../model/blog');
const Classification = require('../model/classification')

const { Op, Sequelize } = require('sequelize');
const Area = require('../model/area')
const env = require('../config/env');
var fs = require('fs'),
  es = require('event-stream');
const { fork } = require('child_process');


// Dynamically associate Blog and Area at runtime
Blog.hasMany(Area, {
  as: 'areas',
  foreignKey: 'area_code',
  sourceKey: 'area_level1',
  constraints: false, // Ignore foreign key constraint
});


const getAllBlogs = async (req, res) => {
  try {
    const userData = JSON.parse(req.user.area_level1);
    let replacements;
    let userCountry= userData.map(item => item.country_area_code);
    replacements = { userCountry };

    let queryData = `
  SELECT 
      blog.id, 
      blog.title, 
      blog.subtitle, 
      blog.message, 
      blog.createdby, 
      blog.message_category, 
      classification.classification_name AS classification_name, 
      blog.area_level1 AS area_code, 
      GROUP_CONCAT(area.name) AS area_name,
      blog.scheduled, 
      blog.is_scheduled, 
      blog.createdby, 
      blog.created, 
      blog.updated, 
      blog.deleted, 
      blog.viewblogcount,
      admin_user.username,
      blog.sending_status,
      blog.sent
  FROM blog
  LEFT JOIN classification ON blog.message_category = classification.id
  LEFT JOIN admin_user ON blog.createdby = admin_user.id
  LEFT JOIN area ON FIND_IN_SET(area.area_code, blog.area_level1)
  WHERE area.area_code IN (:userCountry)
  GROUP BY blog.id
  ORDER BY blog.updated DESC;
`;

    let blogs = await Blog.sequelize.query(queryData, {
      type: Blog.sequelize.QueryTypes.SELECT,
      replacements
    });





    return res.status(200).json({ data: blogs, success: true });
  } catch (error) {
    console.error('Error fetching blogs', error);
    return res.status(500).json({ message: 'Error fetching blogs', error: error });
  }
};

// Get a blog by ID
const getBlogById = async (req, res) => {
  try {
    const { id } = req.body;
    await Blog.increment('viewblogcount', { where: { id } });
    const blog = await Blog.findOne({ where: { id } });
    res.json(blog);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getBroadcastCategory = async (req, res) => {
  try {
    const broadcastCategories = await Classification.findAll({
      attributes: ['id', 'classification_name'],
      where: {
        classification_type: 'broadcast_category'
      }
    });

    res.status(200).json({
      success: true,
      data: broadcastCategories
    });
  } catch (error) {
    console.error('Error fetching broadcast categories:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching broadcast categories',
      error: error.message
    });
  }
};


//  ============================== mobile apis ===================================== 

const getAllBlogsForMobile = async (req, res) => {
  try {
    const id = req.body.id;
    let data=[];
    if(id!=undefined && id!=''){
      data = await Blog.findAll({
        where: {
          id:{
            [Op.gt]:id
          },
          sent: {
            [Op.not]: null  // This checks that 'myField' is not NULL
          }
        }
      });
    }else{
      return res.send({ status: 0, message: "Invalid id", data:[]});
    }


    if (data.length === 0) {
      return res.send({ status: 0, data:[], message: "No Data Found" });
    }

    return res.send({
      status:1,
      data:data
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });

  }
};

const filterBroadcast = async (req, res) => {
  try {
    const { category, country, sent_date } = req.body;

    // console.log("aaa", req.user.area_level1)
    const userData = JSON.parse(req.user.area_level1)
    // console.log(userData)

    
    // console.log(country)
    let replacements;
    let userCountry;
    if(country == undefined) {
      userCountry = userData.map(item => item.country_area_code)
      replacements = { userCountry };
      
    } else {
      userCountry = country
      replacements = { userCountry };
    }

    let cat = 1
    if(category != undefined) {
      cat = `message_category = ${category}`
    }
   
    let dateWise = 1;
    if(sent_date != undefined) {
      const startDate = new Date(sent_date.start);
      const endDate = new Date(sent_date.end);

      dateWise = `scheduled >= '${sent_date.start}' AND scheduled <= '${sent_date.end}'`;
    }


    let queryData = `
    SELECT 
        blog.id, 
        blog.title, 
        blog.subtitle, 
        blog.message, 
        blog.message_category, 
        classification.classification_name AS classification_name, 
        blog.area_level1 AS area_code, 
        area.name AS area_name, 
        blog.scheduled, 
        blog.createdby, 
        blog.created, 
        blog.updated, 
        blog.deleted, 
        blog.viewblogcount
    FROM blog
    LEFT JOIN classification ON blog.message_category = classification.id
    LEFT JOIN area ON blog.area_level1 = area.area_code
    WHERE ${cat} AND area_level1 IN (:userCountry) AND (${dateWise})
    ORDER BY blog.created DESC
  `;

  // console.log(queryData)

    let blogs = await Blog.sequelize.query(queryData, {
      type: Blog.sequelize.QueryTypes.SELECT,
      replacements: replacements
    });

    // if(category){
    //   blogs = blogs.filter((item)=> Number(item.message_category) === Number(category));
    // };

    // if(country){
    //   blogs = blogs.filter((item)=> item.area_code === country);
    // };

    // if(sent_date?.start && sent_date?.end ){
    //     const startDate = new Date(sent_date.start);
    //     const endDate = new Date(sent_date.end);
    //     blogs = blogs.filter((item) => {
    //         const broadCastDate = new Date(item.scheduled);
    //         return broadCastDate >= startDate && broadCastDate <= endDate;
    //     });
    // }

    return res.status(200).json({
      status: true,
      data: blogs
  });

  } catch (error) {
    console.error(error.message);
    res.status(500).send({ status: false, message: error.message });
  }
};


module.exports = { getAllBlogs, getBlogById, getAllBlogsForMobile, getBroadcastCategory, filterBroadcast};
