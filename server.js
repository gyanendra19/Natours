const dotenv = require('dotenv');
dotenv.config({path: './config.env'});
const mongoose = require('mongoose')


process.on('uncaughtException' , (err) => {
    console.log('UNCAUGHT EXCEPTION! Shutting down 💥');
    console.log(err.name, err.message)
    process.exit()
})


const app = require('./app');

const DB = process.env.DATABASE.replace('<password>', process.env.PASSWORD);

mongoose.connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useNewUrlParser: true
}).then(con => {
    // console.log(con.connection)
    console.log('working')
})



// console.log(process.env);

// console.log(DB)

const server = app.listen(3000, () => {
    console.log('Heloooo')
})

process.on('unhandledRejection' , (err) => {
    console.log('UNHANDLED REJECTION! Shutting down 💥');
    console.log(err.name, err.message)
    server.close(() => {
        process.exit(1)
    })
})



