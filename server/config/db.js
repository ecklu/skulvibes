const mongoose = require('mongoose')
const connectMongoDB = async ()=>{

	try{
		mongoose.set('strictQuery', false)
		const conn = await mongoose.connect(process.env.MONGODBURI)
		//const conn = await mongoose.connect(process.env.MONGODBURILOCAL)
		console.log(`Database connected: ${conn.connection.host}`)

	}catch(error){
		console.log(error)
	}
}

module.exports = connectMongoDB;