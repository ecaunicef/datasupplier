const Country = require('../model/country');
const District = require('../model/district');
const db=require('../model/db');
const env = require('../config/env.js')
const axios = require('axios');

const { JSDOM } = require('jsdom');
const dom = new JSDOM();

global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Now you can safely use navigator
var edge = 'msLaunchUri' in navigator && !('documentMode' in document);
const L = require('leaflet');

var fs = require('fs')
    , es = require('event-stream');

// import * as L from 'leaflet';

let countryController = {

    getCountry: async function (req, res) {
        try {

            let userDetails=req.user;
            let countries = userDetails?.cid?.split(',');
            let queryData =
                `SELECT 
                    country_master.id AS country_id, 
                    country_master.name AS country_name, 
                    country_master.level as country_level,
                    districts.district AS district_name 
                    FROM country_master 
                    LEFT JOIN districts ON districts.countryid = country_master.id
                    WHERE country_master.name IN (:countries)
                    `;
            
            let data = await Country.sequelize.query(queryData,
                {
                    replacements: { countries: countries },
                    type: Country.sequelize.QueryTypes.SELECT
                }
            );

            // Group data by country
            let groupedData = data.reduce((acc, item) => {
                let countryId = item.country_id;
                let countryName = item.country_name;
                let district = item.district_name;
    
                if (!acc[countryId]) {
                    acc[countryId] = { 
                        country_id: countryId, 
                        country_name: countryName, 
                        districts: [] 
                    };
                }
    
                // Only add the district if it's not null
                if (district !== null) {
                    acc[countryId].districts.push(district);
                }
    
                return acc;
            }, {});
    
            let result = Object.values(groupedData);
    
            return res.status(200).send({ status: true, data: result });
        } catch (error) {
            return res.status(200).send({ status: false, message: error.message });
        }
    },

    getCountryAll: async function (req, res) {
        try {
            let queryData = `
                SELECT 
                    country_master.id AS country_id, 
                    country_master.name AS country_name, 
                    country_master.chat AS chat,
                    districts.district AS district_name 
                FROM country_master 
                LEFT JOIN districts ON districts.countryid = country_master.id
            `;
            
            let data = await Country.sequelize.query(queryData, {
                type: Country.sequelize.QueryTypes.SELECT
            });
    
            let groupedData = data.reduce((acc, item) => {
                let countryId = item.country_id;
                let countryName = item.country_name;
                let district = item.district_name;
                let chat = item.chat;
    
                if (!acc[countryId]) {
                    acc[countryId] = { 
                        id: countryId,
                        chat: chat, 
                        name: countryName, 
                        districts: [] 
                    };
                }
    
                // Only add the district if it's not null
                if (district !== null) {
                    acc[countryId].districts.push(district);
                }
    
                return acc;
            }, {});
    
            let result = Object.values(groupedData);
    
            return res.status(200).send(result);
        } catch (error) {
            return res.status(200).send({ status: false, message: error.message });
        }
    },

    getAllArea:async function(req,res){
        try {
            // let userDetails = req.user;
            // let countries = userDetails?.cid?.split(',');
            let queryData = `
        SELECT 
            country_master.id AS country_id, 
            country_master.name AS country_name, 
            country_master.level AS country_level,
            country_master.area_code AS country_areaCode,
            districts.area_code AS district_areaCode,
            districts.level AS district_level,
            districts.district AS district_name 
        FROM country_master 
        LEFT JOIN districts ON districts.countryid = country_master.id
    `;
            // WHERE country_master.name IN (:countries)


            let data = await Country.sequelize.query(queryData, {
                type: Country.sequelize.QueryTypes.SELECT
            });

            // Group data by country
            let groupedData = data.reduce((acc, item) => {
                let countryId = item.country_id;
                let countryName = item.country_name;
                let district = {
                   district_name: item.district_name,
                    district_areaCode: item.district_areaCode,
                }

                if (!acc[countryId]) {
                    acc[countryId] = {
                        district_level: item.district_level,
                        country_level: item.country_level,
                        country_areaCode: item.country_areaCode,
                        district_areaCode: item.district_areaCode,
                        country_id: countryId,
                        country_name: countryName,
                        district_name: item.district_name,
                        districts: []
                    };
                }

                // Only add the district if it's not null
                if (district !== null) {
                    acc[countryId].districts.push(district);
                }

                return acc;
            }, {});

            let result = Object.values(groupedData);
            let rowData=[];
            result.forEach((row)=>{
                row?.districts.forEach((district)=>{
                    rowData.push({
                        country_id:row.country_id,
                        country_areaCode: row.country_areaCode,
                        district_name:district.district_name,
                        district_areaCode:district.district_areaCode,
                        country_name: row.country_name,

                    })
                })  
            });

            let countryData=await Country.findAll({});
            // let existingDistrictCountryIds = new Set(rowData.map(item => item.country_id));
            let countryList=[];

            // console.log(existingDistrictCountryIds,"999");


            countryData.forEach((country) => {
                const hasNoMatchingDistrict = rowData.every(item => item.country_id !== country.id);
                if (hasNoMatchingDistrict) {
                    countryList.push({
                        country_id: country.id,
                        country_areaCode: country.area_code,
                        country_name: country.name,
                        district_name: null,
                        district_areaCode: null
                    });
                }
            });




            // let countryList =
            //  countryData
            //     .filter(country => !existingDistrictCountryIds.has(country.id))
            //     .map(country => ({
            //         country_areaCode: country.country_areaCode,
            //         country_name: country.country_name,
            //         district_name: null,
            //         district_areaCode: null
            //     }));

            // console.log(JSON.stringify(countryList));
            rowData = [...rowData,...countryList];

            return res.status(200).send({ status: true, data: rowData });
        } catch (error) {
            console.log(error)
            return res.status(500).send({ status: false, message: error.message });
        }
    },

    getCountryList:async function(req,res){
        try{
            let data=await Country.findAll({});
            res.send({
                status:true,
                data:data
            })

        }catch(err){
            console.log(err);
            return res.status(500).send({ status: false, message: err.message });
        }
    },


    getLocationData: async function(req, res) {
        try {
            const latitude = req.body.latitude
            const longitude = req.body.longitude
            
            const keyPath = env.APP_URL;
            const contantPath = env.constantFilePath
            // const credentials = JSON.parse(fs.readFileSync(keyPath));
            const encodedCredentials = encodeURIComponent(keyPath);
            // var map = L.map('map');

            axios.get(keyPath+"constantfile/world_2006.json")
            .then(response => {
                const geojsonData = response.data;  // Axios response data

                var geoJsonLayer = L.geoJSON(geojsonData)
                var clickedFeature = null;
                var countryDetail = {}

                var userLat = latitude;
                var userLon = longitude;

                // var userLat = 18.2232706;
                // var userLon = -63.0566336;

                // Virgin Island UK
                const aa = {lat: userLat, lng: userLon}
                console.log(aa)


                // Add a marker for the user's location
                const marker = L.marker([userLat, userLon])
                                
                geoJsonLayer.eachLayer(function(layer) {
                    if (layer.getBounds && layer.getBounds().contains(aa)) {
                        clickedFeature = layer.feature;
                    } else if (layer.getLatLng && marker.getLatLng().equals(aa)) {
                        clickedFeature = layer.feature;
                    }
                });

                // console.log(clickedFeature)

                const country_code = clickedFeature.properties.NAME2_
                // console.log(country_code)
                countryDetail['country_code'] = country_code
                countryDetail['country_name'] = clickedFeature.properties.NAME1_

                // go into level 2
                if(country_code != undefined) {
                    if(fs.existsSync(contantPath+"/"+country_code+".json")){
                        axios.get(keyPath+"constantfile/"+country_code+".json")
                        .then(response => {
                            const geojsonData = response.data;  // Axios response data

                            var geoJsonLayer = L.geoJSON(geojsonData)
                            var clickedFeature2 = null;

                            var userLat = latitude;
                            var userLon = longitude;

                            // var userLat = 18.2232706;
                            // var userLon = -63.0566336;

                            // Virgin Island UK
                            const aa = {lat: userLat, lng: userLon}
                            // console.log("bb", aa)


                            // Add a marker for the user's location
                            const marker = L.marker([userLat, userLon])
                                            
                            geoJsonLayer.eachLayer(function(layer) {
                                if (layer.getBounds && layer.getBounds().contains(aa)) {
                                    clickedFeature2 = layer.feature;
                                } else if (layer.getLatLng && marker.getLatLng().equals(aa)) {
                                    clickedFeature2 = layer.feature;
                                }
                            });

                            // console.log("111", clickedFeature)

                            countryDetail['district_code'] = clickedFeature2.properties.id
                            countryDetail['district_name'] = clickedFeature2.properties.name

                            // const country_code = clickedFeature.properties.NAME2_
                            // console.log(countryDetail)

                            // go into level 2
                            

                            // res.send(clickedFeature)

                            res.send(countryDetail)
                        })
                    } else {
                        // console.log("file not exists")
                        res.send('failed')
                    }
                    // return
                    
                }

                
            })
            .catch(error => {
                res.send('failed')
                // console.error('Error fetching GeoJSON data:', error);  // Handle error
            });
        } catch (error) {
            // console.log("14", error)
            res.send(error)
        }
    }
    
    
    
    

};

module.exports = countryController; 
