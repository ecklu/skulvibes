const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    postId: { type: Schema.Types.ObjectId, ref: 'Blogs' },
    author: String,
    date: { type: Date, default: Date.now },
    commentText: String,
    
});

module.exports = mongoose.model('Comment', commentSchema);
