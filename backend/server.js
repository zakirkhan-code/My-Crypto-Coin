const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express());

mongoose.connect(process.env.MONGODB_URI,{
    useNewUrlParser : true,
    useUnifiedTopology : true
}).then(()=> console.log("Database Connected SuccessFully"))
.catch((error)=> console.log("Database Connection Error",error))

const apiRoutes = require('./routes/api');

app.get('/',(req,res)=>{
    res.json({
        message:"MyCoin Api is Running",
        version : "1.0.0",
        endpoints: {
            users : '/api/users',
            transaction:'/api/transactions',
            wallet:'/api/wallet'
        }
    });
});

app.use((req,res,next)=>{
    console.error(err.stack);
    res.status(500).json({ error : "Something Went wrong"});
})

app.listen(PORT,()=>{
    console.log(`server is running on PORT ${PORT}`);
    console.log(`Visit: https://localhost:${PORT}`);
})
