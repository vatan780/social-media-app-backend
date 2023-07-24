const express =require("express");
const app=express()
const cookie_parser=require("cookie-parser")

if(process.env.NODE_ENV !=="production"){
    require("dotenv").config({path:"backend/config/config.env"})
}


//Using Middlewafres
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use(cookie_parser())

//Importing Routes
const post_route=require("./routes/post_route.js")
const user_route=require("./routes/user_route.js")


//Using Routes
app.use("/api/v1",post_route)
app.use("/api/v1",user_route)



module.exports=app