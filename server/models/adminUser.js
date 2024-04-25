const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const adminSchema = new Schema({
	username :{
		type: String,
		required: true,
		unique: true,
	},
	email:{
        type:String,
        required:true,
        unique:true,
        match:/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    },
    role:{
		type:String,
		required: true
	},
	password:{
		type: String,
		required: true
	}

})

module.exports = mongoose.model('adminUser',adminSchema)