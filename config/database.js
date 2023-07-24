const mongoose=require("mongoose");
exports.connectDatabase=()=>{
    mongoose
    .connect(process.env.MONGO_URI)
    .then((con)=>console.log(`Database Connected:${process.env.PORT}`))
    .catch((err)=>console.log(err));
}