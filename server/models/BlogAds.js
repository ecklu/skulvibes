const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const adsSchema = new Schema({
	adTitle :{
		type: String,
		required: true,
		
	},
	adImage :{
		type: String,
		required: true,
		
	},
	
    adPostBy:{
		type:String,
		required: true
	},
	adSchool_name:{
		type: String,
		required: true
	},
	payment_status:{
		type: String,
		required: true
	}

})

module.exports = mongoose.model('blogAd',adsSchema)