const mongoose = require('mongoose')

const Schema = mongoose.Schema;

const blogSchema = new Schema({
	title:{
		type:String,
		required: true
	},
	category:{
		type:String,
		required: true
	},
	body:{
		type:String,
		required: true
	},
	filepic:{
        type: String
    },

	written_by:{
		type:String,
		required: true
	},
	artile_status:{
		type:String,
		required: true
	},
	school_name:{
		type:String,
		required: true
	},
	createdAt:{
		type:Date,
		default: Date.now
	},
	updatedAt:{
		type:Date,
		default: Date.now
	},
	likes: {
        type: Number,
        default: 0
    }, 
    views: {
        type: Number,
        default: 0 // Start with 0 views
    },
	users_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'BlogUser'
    },
    comment_id:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comments'
    },
});

module.exports = mongoose.model('Blog', blogSchema)