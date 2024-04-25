const mongoose = require('mongoose')
const Schema = mongoose.Schema;

const blogUserSchema = new Schema({
	username :{
		type: String,
		required: true,
		unique: true,
	},
	date_of_birth :{
		type: String,
		required: true,
		
	},
	gender :{
		type: String,
		required: true,
		
	},
	email:{
        type:String,
        required:true,
        unique:true,
        match:/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    },
    school_name :{
		type: String,
		required: true,
		
	},
	start_year :{
		type: Number,
		required: true,
		
	},
	end_year :{
		type: Number,
		required: true,
		
	},
	student_contact :{
		type: String,
		required: true,
		
	},
	
	user_status :{
		type: String,
		required: true,
		
	},
	role :{
		type: String,
		required: true,
		
	},
	password:{
		type: String,
		required: true
	},
	studentID_pic:{
        type: String
    },
    
	createdAt:{
		type:Date,
		default: Date.now
	},
	updatedAt:{
		type:Date,
		default: Date.now
	},
	blog_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blogs'
    },
	

})

module.exports = mongoose.model('user_student',blogUserSchema)

