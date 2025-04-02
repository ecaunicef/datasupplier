const Area = require('../model/area');
const sequelize = require('../model/db');
const { Sequelize } = require('sequelize');
const createCsvWriter = require('csv-writer').createObjectCsvWriter;
const fs = require('fs');
const env = require("../config/env");


const areaController = {
  areaList: async (req, res) => {
    try {
      const query = `
            SELECT id, name, name_nl, name_fr, name_es, area_code, level,status, parent_area_code, chat,
                   createdBy, updatedBy, deletedBy, created, updated
            FROM area ORDER BY created DESC
        `;

      const data = await sequelize.query(query, {
        type: sequelize.QueryTypes.SELECT,
      });

      return res.send({
        status: true,
        data: data,
      });
    } catch (err) {
      console.error("Error fetching area list:", err);

      return res.send({
        status: false,
        message: "Something went wrong while fetching the area list.",
      });
    }
  },
  areaLevel: async (req, res) => {
    try {

      // let areaList = await getAreaHierarchy('IND');
      let areaList = await Area.findAll({
        where: {
          level: 1
        }
      });
      return res.send({
        status: true,
        data: areaList
      })

    } catch (err) {
      console.log(err);
      return res.send({
        status: false,
        message: "Something went wrong"
      })
    }
  },

  getAreaHierarchyList: async (req, res) => {
    try {
      let areaList = await getAreaHierarchy('IND');
    } catch (error) {
      console.log(error);
      return res.send({
        status: false,
        message: "Something went wrong"
      })
    }
  },
  getAllAreaList: async (req, res) => {
    try {
      let userDetails = req.user;
      let countryList = JSON.parse(userDetails.area_level1);
      let countryIdList = countryList.map((country) => country?.country_id);
      let areaList = await sequelize.query(
        `SELECT 
       country.id AS country_id, 
       country.status AS status,
       country.name AS country_name, 
       country.area_code AS country_area_code, 
       country.level AS country_level,
       district.id AS district_id, 
       district.name AS district_name,
       district.area_code AS district_area_code,
       district.level AS district_level
   FROM area AS country 
   LEFT JOIN area AS district 
   ON district.parent_area_code = country.area_code 
   WHERE country.level = 1 AND country.status=1
   AND country.id IN (:countryIdList)`,
        {
          type: sequelize.QueryTypes.SELECT,
          replacements: { countryIdList }
        }
      );

      let data = areaList.reduce((result, row) => {
        let country = result.find(c => c.country_id === row.country_id);
        if (!country) {
          country = {
            country_name: row.country_name,
            country_id: row.country_id,
            country_area_code: row.country_area_code,
            country_level: row.country_level,
            districts: []
          };
          result.push(country);
        }

        if (row.district_id) {
          country.districts.push({
            district_id: row.district_id,
            district_name: row.district_name,
            district_area_code: row.district_area_code,
            district_level: row.district_level
          });
        }

        return result;
      }, []);

      return res.send({
        status: true,
        data: data
      });

    } catch (error) {
      console.log(error);
      return res.send({
        status: false,
        message: "Something went wrong"
      })
    }
  },
  getAllAreaData: async (req, res) => {
    try {
      // let userDetails = req.user;
      // let countryList = JSON.parse(userDetails.area_level1);
      // let countryIdList = countryList.map((country) => country?.country_id);
      let level = 1; // Example dynamic value
      let areaList = await sequelize.query(
                `SELECT 
              country.id AS country_id, 
              country.name AS country_name,
              country.name_nl AS country_name_nl, 
              country.name_fr AS country_name_fr,
              country.name_es AS country_name_es,
              district.id AS district_id, 
              country.status AS country_status,
              district.name AS district_name,
              district.name_nl AS district_name_nl,
              district.name_fr AS district_name_fr,
              district.name_es AS district_name_es,
              country.area_code AS country_area_code,
              district.area_code AS district_area_code
            FROM area AS country 
            LEFT JOIN area AS district 
            ON district.parent_area_code = country.area_code 
              AND district.status = 1
            WHERE country.level = :level 
              AND country.status = 1`,
              {
                type: sequelize.QueryTypes.SELECT,
                  replacements: { level }
              }
        );

      let data = areaList.reduce((result, row) => {
        let country = result.find(c => c.country_id === row.country_id);
        if (!country) {
          country = {
            country_name: row.country_name ,
            country_name_nl: row.country_nl ?? '#' + row.country_name,
            country_name_fr: row.country_fr ?? '#' + row.country_name,
            country_name_es: row.country_es ?? '#' + row.country_name,
            country_id: row.country_id,
            country_area_code: row.country_area_code,
            districts: []
          };
          result.push(country);
        }

        if (row.district_id) {
          country.districts.push({
            district_id: row.district_id,
            district_name: row.district_name,
            district_name_nl: row.district_name_nl ?? "#" + row.district_name,
            district_name_fr: row.district_name_fr ?? "#" + row.district_name,
            district_name_es: row.district_name_fr ?? "#" + row.district_name,
            district_area_code: row.district_area_code,
          });
        }

        return result;
      }, []);

      return res.send({
        status: true,
        data: data
      });

    } catch (error) {
      console.log(error);
      return res.send({
        status: false,
        message: "Something went wrong"
      })
    }
  },

  exportAreaTemplate: async (req, res)=> {
    let tempDataArr = [];
    try {
        let tempArea = await Area.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('name')), 'area_name'],
                ['area_code', 'area_code'], 
                ['level', 'area_level'],
                ['parent_area_code', 'p_code'],
            ],
        });


        tempArea.forEach(area => {
            let tempjson = {};
            tempjson.area_name = area['dataValues'].area_name;
            tempjson.area_code = area['dataValues'].area_code; 
            tempjson.area_level = area['dataValues'].area_level;
            tempjson.p_code = area['dataValues'].p_code;

            tempDataArr.push(tempjson);
        });

        const csvWriter = createCsvWriter({
            path: `${env.logFilePath}Area_Master.csv`,
            header: [
                { id: 'area_name', title: 'Area Name' },
                { id: 'area_code', title: 'Area Code' },
                { id: 'area_level', title: 'Area Level' },
                { id: 'p_code', title: 'Parent Area ID' },
            ],
        });

        await csvWriter.writeRecords(tempDataArr);

        fs.writeFileSync(
            `${env.logFilePath}Area_Master.csv`,
            '\ufeff' + fs.readFileSync(`${env.logFilePath}Area_Master.csv`),
            'utf8'
        );

        console.log('File downloaded successfully');

        res.send({
            success: true,
            filepath: 'Area_Master.csv',
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json(err);
    }
},


  getLevel2data: async (req, res) => {
    try {
      const areaCode = req.body.areaCode;
      let areaList = await Area.findAll({
        where: {
          level: 2,
          parent_area_code: areaCode
        }
      });
      return res.send({
        status: true,
        data: areaList
      })


    } catch (error) {
      console.log(error);
      return res.send({
        status: false,
        message: "Something went wrong"
      })
    }

  }

}


module.exports = areaController;

async function getAreaHierarchy(area_code) {
  const area = await Area.findOne({
    where: { area_code: area_code }
  });

  if (!area) {
    return null;
  }

  const childAreas = await Area.findAll({
    where: { parent_area_code: area_code }
  });

  const childHierarchy = await Promise.all(childAreas.map(async (child) => {
    return await getAreaHierarchy(child.area_code);
  }));

  return [{
    area_code: area.area_code,
    name: area.name,
    children: childHierarchy
  }];
}