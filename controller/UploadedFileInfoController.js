const UploadedFileInfo = require('../model/uploaded_file_info');
const { Op } = require('sequelize');


let uploadedFileInfoController = {

    getImportLog: async function (req, res) {

        try {

            let queryData = `
        SELECT 
            uploaded_file_info.id,
            uploaded_file_info.user_id,
            uploaded_file_info.file_name,
            uploaded_file_info.language_type,
            uploaded_file_info.file_detail,
            uploaded_file_info.type,
            uploaded_file_info.error_file,
            uploaded_file_info.createdAt,
            uploaded_file_info.updatedAt,
            credential.username
        FROM uploaded_file_info
        LEFT JOIN credential ON credential.id = uploaded_file_info.user_id
    `;

            let data = await UploadedFileInfo.sequelize.query(queryData, {
                type: UploadedFileInfo.sequelize.QueryTypes.SELECT
            });


            res.status(200).json({status: true, data: data});

        } catch (error) {

        console.error(error.message);
        res.status(500).json({status: false, message: error.message});

        }
    }

};

module.exports = uploadedFileInfoController; 
