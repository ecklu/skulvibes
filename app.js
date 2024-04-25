require('dotenv').config();
const path = require('path')
const express = require('express')
const expressLayout = require('express-ejs-layouts')
const methodOverride = require('method-override')
const cookieParser = require('cookie-parser')
const MongoStore = require('connect-mongo')
const session = require('express-session')

const connectDB = require('./server/config/db')

const app = express()
const PORT = 5000 || process.env.PORT


//connection to DB
connectDB()

app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(cookieParser())

app.use((req,res, next)=>{
  //Giving access to all clients
  res.header('Access-Control-Allow-Origin','*')
  res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization')
  if(req.method === 'OPTIONS'){
      res.header('Access-Control-Allow-Methods','PUT,POST,PATCH,DELETE,GET')
      return res.status(200).json({});
  }
  next()
})

app.use(session({
	secret: 'keyboard cat',
	resave: false,
	saveUninitialized:true,
	store: MongoStore.create({
		mongoUrl:process.env.MONGODBURI
	})
}))

app.use(express.static('public'))

app.use(expressLayout)
app.set('layout', './layouts/main')
app.set('view engine', 'ejs')


app.use('/', require('./server/routes/main'));
app.use('/', require('./server/routes/blog'));
app.use('/admin', require('./server/routes/admin'));




app.listen(PORT, ()=>{
	console.log(`Sever running on port: ${PORT}`)
})