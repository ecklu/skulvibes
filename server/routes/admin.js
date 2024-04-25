const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const AdminUser = require('../models/adminUser')
const StudentUser = require('../models/BlogUser')
const Blogs = require('../models/Blogs')
const BlogAds = require('../models/BlogAds')
const Category = require('../models/Categories')

const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')

const adminLayouts ='../views/layouts/admin'
const jwtSecret = process.env.JWT_ECRET;



//setting up my file storage
var storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/upload/')
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname)
    }
  })
  var upload = multer({storage:storage})


//upload.single('execfile')

router.get('/login', (req,res)=>{
	try{
	res.render('admin/auth-login',{layout:adminLayouts })
}catch(error){
	console.log(error)
}
})


//setting  ads folder
var storage = multer.diskStorage({
    destination : function(req,file,cb){
        cb(null,'./public/blogAds/')
    },
    filename: function(req,file,cb){
        cb(null, Date.now() + file.originalname)
    }
  })
  var uploadAds = multer({storage:storage})





//upload.single('execfile')

router.get('/login', (req,res)=>{
	try{
	res.render('admin/auth-login',{layout:adminLayouts })
}catch(error){
	console.log(error)
}
})


//checking login

const authMiddleware = async(req,res,next)=>{
	const token = req.cookies.token;

	if(!token){
		return res.status(401).json({message:'unauthorized1'})

	}
	try{
		const decoded = jwt.verify(token, jwtSecret)
		const adminId = decoded.userId;
		  const role = decoded.role;
		
		console.log('this is my id',adminId)
		
		const adminUser = await AdminUser.findById(adminId);
		// if ( adminUser.role !== 'admin') {
        
        //  return res.status(401).json({ message: 'Unauthorizedss' });
        // }
		console.log("this is role", role)
		
		req.userId = adminId;
		req.role = role;
		console.log("this is role for reg", req.role)
		next();

	}catch(error){
		console.log(error)
		res.status(401).json({message:'unauthorized2'})


	}
}


// Middleware to check if the user is an admin
const isAdmin = (req, res, next) => {
    // Assuming you have stored the user's role in the req.role object
    if (req.role === 'admin') {
    	console.log('my role',req.role)
        // User is an admin, allow access to the route
        next();
    } else {
        // User is not an admin, deny access with a 403 Forbidden response
        res.status(403).json({ message: 'Access forbidden' });
    }
};







router.post('/loginAdmin',async (req,res)=>{
	try{

		const {username,password} = req.body;

		const userAdmin = await AdminUser.findOne({username});

		if(!userAdmin){
			return res.status(401).json({message: "invalid credentials"})
		}
		const isPasswordValid = await bcrypt.compare(password,userAdmin.password)

		if(!isPasswordValid){
			return res.status(401).json({message:"invalid credentials"})
		}

		const token = jwt.sign({userId:userAdmin._id,role: 'admin'}, jwtSecret)
		res.cookie('token',token,{httpOnly:true} )
		res.redirect('/admin/dashboard')

	}catch(error){
		console.log(error)

	}

})




router.get('/dashboard',authMiddleware,isAdmin,async (req,res)=>{

	try{
	res.render('admin/index',{layout:adminLayouts })
	}
	catch(error){
		console.log(error)
	}
})



//creating blog page
router.get('/create-blog',authMiddleware, isAdmin,async (req,res)=>{

	try{
		const data = await Category.find()
	res.render('admin/create-blog',{layout:adminLayouts ,data})
	}
	catch(error){
		console.log(error)
	}
})

router.post('/create-blog',authMiddleware,isAdmin,upload.single('image'), async (req,res)=>{
	console.log('my blog creation')

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
				school_name: req.body.school_name
			})

			await Blogs.create(newBlog)
			res.redirect('/admin/create-blog')

		}catch(error){
			console.log(error)

		}
		

	}catch(error){
		console.log(error)

	}
})

//view all blogs
router.get('/view-blogs',authMiddleware,isAdmin,async (req,res)=>{

	try{
		const data = await Blogs.find()
	res.render('admin/view-blogs',{layout:adminLayouts , data})
	}
	catch(error){
		console.log(error)
	}
})

//blogs details
router.get('/blog-details/:id',authMiddleware,isAdmin, async (req,res)=>{
	console.log("my id",req.params.id)

	try{
		const data = await Blogs.findOne({_id:req.params.id})
	res.render('admin/blog-details',{layout:adminLayouts , data})
	}
	catch(error){
		console.log(error)
	}
})

//publishing article
router.post('/publish/:id', async(req,res)=>{
	try{

		let publish = {}

		publish.artile_status = "Publish"
		let query = {_id:req.params.id}
		await Blogs.updateOne(query,publish)
		res.redirect('/admin/view-blogs')


	}catch(error){
		console.log(error)
	}
})

//drafting article
router.post('/draft/:id',authMiddleware,isAdmin, async(req,res)=>{
	try{

		let draft = {}

		draft.artile_status = "Draft"
		let query = {_id:req.params.id}
		await Blogs.updateOne(query,draft)
		res.redirect('/admin/view-blogs')


	}catch(error){
		console.log(error)
	}
})


//blog approvals
router.get('/blog-approvals',authMiddleware,isAdmin, async (req,res)=>{

	try{
		const data = await Blogs.find()
		const count = await Blogs.countDocuments()
		const drafts = await Blogs.find({artile_status:"Draft"}).countDocuments()
		const pending = await Blogs.find({artile_status:"Pending"}).countDocuments()
		const publish = await Blogs.find({artile_status:"Publish"}).countDocuments()
	res.render('admin/blog-approvals',{layout:adminLayouts , data,count,drafts,pending,publish})
	}
	catch(error){
		console.log(error)
	}
})



//view all users applications
router.get('/view-students',authMiddleware,isAdmin,async (req,res)=>{

	try{
		const data = await StudentUser.find()
	res.render('admin/view-studentUsers.ejs',{layout:adminLayouts , data})
	}
	catch(error){
		console.log(error)
	}
})

//view  users details applications
router.get('/view-students-details/:id',authMiddleware,isAdmin,async (req,res)=>{

	try{
		const data = await StudentUser.findById({_id: req.params.id})
	res.render('admin/user-details.ejs',{layout:adminLayouts , data})
	}
	catch(error){
		console.log(error)
	}
})


//Approving user students

//drafting article
router.post('/approve/:id',authMiddleware,isAdmin, async(req,res)=>{
	try{

		let studentUser = {}

		studentUser.user_status = "Approved"
		let query = {_id:req.params.id}
		await StudentUser.updateOne(query,studentUser)
		res.redirect('/admin/view-students')


	}catch(error){
		console.log(error)
	}
})

//view all ads
router.get('/view-ads',authMiddleware, isAdmin,async (req,res)=>{

	try{
		const data = await BlogAds.find()
	res.render('admin/view-Adsblogs',{layout:adminLayouts, data })
	}
	catch(error){
		console.log(error)
	}
})


//creating ads
router.get('/create-ads',authMiddleware, isAdmin,async (req,res)=>{

	try{
	res.render('admin/create-ads',{layout:adminLayouts })
	}
	catch(error){
		console.log(error)
	}
})


//Post ads Blogs
router.post('/blog-ads',authMiddleware,isAdmin,uploadAds.single('image'), async (req,res)=>{
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
			res.redirect('/admin/create-ads')

		}catch(error){
			console.log(error)

		}
		

	}catch(error){
		console.log(error)

	}
})


//view category
router.get('/category',authMiddleware, isAdmin,async (req,res)=>{

	try{
		const data = await Category.find()
	res.render('admin/view-categories',{layout:adminLayouts,data })
	}
	catch(error){
		console.log(error)
	}
})

//creating category
router.get('/create-category',authMiddleware, isAdmin,async (req,res)=>{

	try{
	res.render('admin/create-category',{layout:adminLayouts })
	}
	catch(error){
		console.log(error)
	}
})


//Post for category
router.post('/category',authMiddleware,isAdmin, async (req,res)=>{
	try{

		console.log(req.body)
		try{
			const category = new Category({
				category_name : req.body.category_name,
				
			})

			await Category.create(category)
			res.redirect('/admin/category')

		}catch(error){
			console.log(error)

		}
		

	}catch(error){
		console.log(error)

	}
})




router.get('/register', (req,res)=>{
	res.render('admin/auth-register',{layout:adminLayouts })
})

router.post('/register',async (req,res)=>{
	try{
		const {username,email,password} = req.body;
		const hashPassword = await bcrypt.hash(password, 10)
		const roles ="admin"

		try{

			const user = await AdminUser.create({username,email,role:roles,password:hashPassword})
			res.status(201).json({message:"user created", user})
			res.redirect('/register')

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
	res.redirect('/admin/login')
})







module.exports = router;