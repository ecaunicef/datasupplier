const mongoose = require('mongoose');  
const Schema = mongoose.Schema;

const userTokenSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        required: true,
        ref:'users'
    },
    token: {
        type: String,
        required: true,
    },
    status: {type: Number, default:1}
},{ timestamps: true });

module.exports = mongoose.model("UserToken", userTokenSchema,'user_token');