const express = require('express')
const router = express.Router()
const https =require('https')
const multer = require('multer')
const path = require('path')
const Blogs = require('../models/Blogs')
const UserStudent = require('../models/BlogUser')
const Comment = require('../models/Comments')
const BlogAds = require('../models/BlogAds')
const Category = require('../models/Categories')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const jwtSecret = process.env.JWT_ECRET;



//setting up my file storage
var storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/studentIDS_image/')
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname)
    }
  })
  var upload = multer({storage:storage})


  //for the blogs(iploads folder)
  //setting up my file storage
var storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/upload/')
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname)
    }
  })
  var uploadblog = multer({storage:storage})

//placing ads into the ads folder
var storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/blogAds/')
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname)
    }
  })
  var uploadAds = multer({storage:storage})








const authMiddlewares = async (req,res,next)=>{
	const token = req.cookies.token;

	if(!token){
		return res.status(401).json({message:'unauthorized'})

	}
	try{
		const decoded = jwt.verify(token, jwtSecret)
		const studentuserId = decoded.userId;
		 const role = decoded.role;
		

		console.log('this is my id',studentuserId)

		const studentUser = await UserStudent.findById(studentuserId);
		//if (studentUser.role !== 'user') {
            //return  res.status(401).json({ message: 'Unauthorizedss' });
        //}

      

		console.log("this is role", role)
		req.usersId = studentuserId;
		req.role = role;
		next();

	}catch(error){
		console.log(error)
		res.status(401).json({message:'unauthorized'})

	}
}


router.get('/blog', async (req,res)=>{

	try{

		const data = await Blogs.find({artile_status:"Publish"}).sort({ createdAt: -1 })
		const latestData = await Blogs.find({artile_status:"Publish"}).sort({ createdAt: -1 }).limit(4)
		const blogAds = await BlogAds.find({payment_status:"Payed"})
	res.render('blog-grid',{ data,blogAds ,latestData})
	}
	catch(error){
		console.log(error)
	}
	
})


router.post('/login', async (req,res)=>{
	console.log("working post")
	try{
	

		const {username, password} = req.body;

// Attempt to find the user by username
const userStudent = await UserStudent.findOne({username});

// First, check if the user exists
if (!userStudent) {
    return res.status(401).json({message: "invalid credentials"});
}

// Check if the user's status is "Pending"
if (userStudent.user_status === "Pending") {
    return res.status(401).json({message: "not yet approved"});
}

// Check if the password is valid
const isPasswordValid = await bcrypt.compare(password, userStudent.password);
if (!isPasswordValid) {
    return res.status(401).json({message: "invalid credentials"});
}

// If all checks pass, sign the JWT and set it in a cookie
const token = jwt.sign({userId: userStudent._id, role: 'user'}, jwtSecret);
res.cookie('token', token, {httpOnly: true});

// Redirect the user to the blog submission page
res.redirect('/submit-blog');


	}catch(error){
		console.log(error)

	}
	//res.render('signup')
})


router.get('/submit-blog',authMiddlewares, async(req,res)=>{
	console.log("this is my user ID for usser",req.usersId )

	try{
		const data = await Category.find();
		const studentUserInfo = await UserStudent.findById({_id:req.usersId });
		console.log("my new info",studentUserInfo)
		const user_Id = req.usersId 
	res.render('submit-blog',{user_Id,studentUserInfo,data})

}catch(error){
	console.log(error)
}
})


router.post('/submit-blog',authMiddlewares,uploadblog.single('image'), async (req,res)=>{
	try{

		console.log(req.body)
		try{
			const newBlog = new Blogs({
				title : req.body.title,
				category : req.body.category,
				body: req.body.body,
				filepic : req.file.path.toString().replace('public',''),
				written_by : req.body.written_by,
				artile_status : "Pending",
				school_name: req.body.school_name,
				users_id : req.body.user_id
			})

			await Blogs.create(newBlog)
			res.redirect('/submit-blog')

		}catch(error){
			console.log(error)

		}
		

	}catch(error){
		console.log(error)

	}
})


//Blogs ads
router.get('/blog-ads',authMiddlewares, async(req,res)=>{
	console.log("this is my user ID for usser",req.usersId )

	try{
	const studentUserInfo = await UserStudent.findById({_id:req.usersId });
	res.render('blog-ads',{studentUserInfo})

}catch(error){
	console.log(error)
}
})

//Post ads Blogs
router.post('/blog-ads',authMiddlewares,uploadAds.single('image'), async (req,res)=>{
	try{

		console.log(req.body)
		try{
			const blogAds = new BlogAds({
				adTitle : req.body.adTitle,
				adImage : req.file.path.toString().replace('public',''),
				adPostBy : req.body.adPostBy,
				payment_status : "Pending",
				adSchool_name: req.body.adSchool_name,
				//users_id : req.body.user_id
			})

			await BlogAds.create(blogAds)
			res.redirect('/blog-ads')

		}catch(error){
			console.log(error)

		}
		

	}catch(error){
		console.log(error)

	}
})



router.get('/my-blogs',authMiddlewares, async (req,res)=>{

	try{
		console.log("my blogs id",req.usersId)
		const data = await Blogs.find({users_id:req.usersId}).sort({title: -1 })
		const totalBlogs = await Blogs.find({users_id:req.usersId}).countDocuments();
	res.render('my-blogs',{ data,totalBlogs})
	}
	catch(error){
		console.log(error)
	}
	
})


//middleware to check views
function incrementPostViews(req, res, next) {
    const postId = req.params.id;
    Blogs.findByIdAndUpdate(postId, { $inc: { views: 1 } }, { new: true })
        .then(post => {
            req.post = post; // Save post for downstream use
            next();
        })
        .catch(error => {
            console.error("Error updating post views", error);
            next(); // Continue even if there's an error
        });
}


router.get('/read-more/:id',incrementPostViews,async (req,res)=>{
	console.log("read more sections")
	try{
		//console.log("my blogs id",req.usersId)
		const data = await Blogs.findOne({_id:req.params.id})
		const comments = await Comment.find({ postId: req.params.id }).countDocuments();
        //res.json(comments);
		
	res.render('read-more',{ data,comments})
	}
	catch(error){
		console.log(error)
	}
	
})


//liking post
router.post('/like-post/:id', async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Blogs.findById(postId);

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        post.likes += 1;
        await post.save();

        res.json({ likes: post.likes });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error when liking the post' });
    }
});



//comments 
router.get('/comments/:postId', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.postId });
        res.json(comments);
    } catch (error) {
        res.status(500).send('Error retrieving comments');
    }
});



router.post('/comments/:postId', async (req, res) => {
	console.log('my comment id',req.params.postId)
	try{
   try {
        const newComment = new Comment({
            postId: req.params.postId,
            author: req.body.author,
            commentText: req.body.commentText,
            
        });
        //await newComment.save();
        await Comment.create(newComment)
        res.redirect(`/read-more/${req.params.postId}`)
    } catch (error) {
    	console.log(error)
        res.status(500).send('Error adding comment');
    }

}catch(error){
	console.log(error)
}
});


router.get('/category', async (req,res)=>{
	try{
	const countData = await Blogs.find({ category: "Education"}).countDocuments();
	const countdDataSports = await Blogs.find({ category: "Sports"}).countDocuments()
	const countDataEnt = await Blogs.find({ category: "Entertainment"}).countDocuments()
	res.render('category',{countData,countdDataSports,countDataEnt})
}catch(error){
	console.log(error)
}
})


//education category
router.get('/category-education', async(req,res)=>{
	try{
	const data = await Blogs.find({ category: "Education"}).sort({ createdAt: -1 });
	
	const blogAds = await BlogAds.find({payment_status:"Payed"})
	res.render('blog-education',{data,blogAds})
}catch(error){
	console.log(error)
}
})


//sports category
router.get('/category-sports', async(req,res)=>{
	try{
	const data = await Blogs.find({ category: "Sports"}).sort({ createdAt: -1 });
	
	const blogAds = await BlogAds.find({payment_status:"Payed"})
	res.render('blog-sports',{data,blogAds})
}catch(error){
	console.log(error)
}
})

//entertainment category
router.get('/category-ent', async(req,res)=>{
	try{
	const data = await Blogs.find({ category: "Entertainment"}).sort({ createdAt: -1 });
	
	const blogAds = await BlogAds.find({payment_status:"Payed"})
	res.render('blog-ent',{data,blogAds})
}catch(error){
	console.log(error)
}
})















router.get('/signup', (req,res)=>{
	res.render('signup')
})



router.post('/signup',upload.single('studentID_pic'),async (req,res)=>{
	try{
		//const {username,date_of_birth,gender,email,school_name,student_contact,school_position,teachers_contact,password,studentID_pic} = req.body;
		
		const hashPassword = await bcrypt.hash(req.body.password, 10)

		const studentUser = new UserStudent()
		studentUser.username = req.body.username
		studentUser.date_of_birth = req.body.date_of_birth
		studentUser.gender = req.body.gender
		studentUser.email = req.body.email
		studentUser.school_name = req.body.school_name
		studentUser.start_year = req.body.start_year
		studentUser.end_year = req.body.end_year
		studentUser.student_contact = req.body.student_contact
		studentUser.user_status = "Pending"
		studentUser.password = hashPassword
		studentUser.role = "user"
		studentUser.studentID_pic = req.file.path.toString().replace('public','')
		

		try{


		

			const user = await UserStudent.create(studentUser)
			//res.status(201).json({message:"student user created", user})
			res.redirect('/blog')

		}catch(error){
			if(error.code === 11000){
				res.status(409).json({message:'user already in use'})
			}
			res.status(500).json({message:"internal server error"})

		}
		

	}catch(error){

		console.log(error)
	}
	
})

//logout
router.get('/logout',(req,res)=>{
	res.clearCookie('token')
	res.redirect('/blog')
})



//ping handler
router.get('/ping',(req,res)=>{
	res.send('server is wake')
})

const pingUrl = 'https://skulvibes.onrender.com/ping';

const pingInterval = 5 * 60 * 1000;

function pingsServer(){

	https.get(pingUrl, (res)=>{
		console.log(`Ping successful: ${res.statusCode}`)
	}).on('error',(err)=>{
		console.log('Ping Failed', err)
	})
}

setInterval(pingsServer, pingInterval)




module.exports = router;