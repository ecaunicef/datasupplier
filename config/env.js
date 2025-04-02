// module.exports = env;
// let db_connection = `mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

// if(process.env.DB_USERNAME){
//     // mongodb://admin:password@localhost:27017/db'
//     db_connection = `mongodb://${process.env.DB_USERNAME}:${encodeURIComponent(process.env.DB_PASSWORD)}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}?authSource=admin`;
// }


if (process.env.DB_USERNAME && process.env.DB_PASSWORD) {
  // MySQL connection with credentials
  db_connection = {
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306  // Default port for MySQL is 3306
  };
} else {
  // MySQL connection without credentials
  db_connection = {
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306
  };
}




const env = {
  logFilePath: process.env.LOG_FILE_PATH,
  logFilePathDashboard: process.env.LOG_FILE_PATH_DASHBOARD,
  passwordExpiryDaysCount: process.env.PASSWORD_EXPIRY_DAYS_COUNT,
  dbConfig: {
    env: process.env.ENV,
    db: db_connection,
    port: process.env.DB_PORT,
    hostIp: process.env.DB_HOST,
    radisPort: process.env.REDIS_PORT
  },
  privateKey: process.env.APP_KEY,
  admin_email: process.env.ADMIN_EMAIL,
  admin_pass: process.env.ADMIN_PASS,
  downloads: process.env.DOWNLOADS,
  constantFilePath:process.env.CONSTANT_FILE_PATH,
  RESOURCEPATH: process.env.RESOURCE_PATH,
  APP_URL: process.env.APP_URL,


  DOMAIN_URL:process.env.DOMAIN_URL,
  MAIL_DRIVER:process.env.MAIL_DRIVER, 
  MAIL_HOST:process.env.MAIL_HOST,                                 
  MAIL_PORT:process.env.MAIL_PORT,                                               
  MAIL_USERNAME:process.env.MAIL_USERNAME,                                
  MAIL_PASSWORD:process.env.MAIL_PASSWORD,                                
  MAIL_ENCRYPTION:process.env.MAIL_ENCRYPTION,                               
  MAIL_FROM_ADDRESS : process.env.MAIL_FROM_ADDRESS,
  PRIMARY_FOLDER_PATH:process.env.PRIMARY_FOLDER_PATH,
  EXPORT_DATA:process.env.EXPORT_DATA,
  PRIMARY_API:process.env.PRIMARY_API,

  indicatorFrequency: {
    "1": "Annual ",
    "2": "Half-year",
    "3": "Quarter",
    "4": "Month",
    "5": "5 year",
    "6": "2 year",
    "7": "3 Year",
    "8": "10 Year"
  },

  indicatorType: {
    "1": "Quantative",
    "2": "Qualitative",
  },

  indicatorCategory: {
    "OC": "Outcome",
    "OP": "Output",
    "PRO": "Process",
  },

  bar_menu: {
    "m_1": "sdg-overview",
    "m_2": "sdg-achievements",
    "m_3": "configurations",
    "m_4": "user-management",
    "m_5": "download-reports",
    "m_6": "download-4sap",
    "m_7": "data-entry",
    "m_8": "reset_data_user_master_config",
    "m_9": "platform_feature_config"
  },

  ACL: {
    "1": ["m_1", "m_2", "m_3", "m_4", "m_5", "m_6", "m_7", "m_8", "m_9"],
    "3": ["m_1", "m_2", "m_3", "m_4", "m_5", "m_6"],
    "4": ["m_1", "m_2", "m_3", "m_4", "m_5", "m_6"],
    "5": ["m_1", "m_2", "m_3", "m_4", "m_5", "m_6", "m_7"],
    "6": ["m_1", "m_2", "m_3", "m_4", "m_5", "m_6", "m_7"],
    "7": ["m_7"],
    "8": ["m_1", "m_2", "m_3", "m_4", "m_5", "m_6", "m_7"],
    "9": ["m_1", "m_2", "m_3", "m_4", "m_5", "m_6", "m_7"],
    "10": ["m_1", "m_2", "m_3", "m_4", "m_5", "m_6", "m_7"],
    "11": ["m_1", "m_2", "m_3", "m_4", "m_5", "m_6", "m_7"],
    "12": []

  },
  timeperiod_range: ['2018-19', '2019-20', '2020-21', '2021-22', '2022-23'],
  maxLoginFailedAttempt: 5,
  failedLoginAttemptUnBlockTime: 30 // in minutes 
}

module.exports = env;