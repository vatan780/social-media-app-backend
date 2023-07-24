const user_model = require("../models/User_Models")
const post_model=require("../models/Post_Models")

const {sendEmail}=require("../middlewares/sendEmail")


exports.register = async (req, res) => {
    try {

        const { name, email, password } = req.body
        let user = await user_model.findOne({ email });
        if (user) {
            return res.status(400).json({
                success: false,
                message: "User already exists",
            });
        }
        user = await user_model.create({
            name,
            email,
            password,
            avatar: { public_id: "sample_id", url: "sampleurl" },
        });

        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 100),
            httpOnly: true,
        };

        res.status(200).cookie("token", token, options).json({
            success: true,
            user,
            token
        })



    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body
        const user = await user_model.findOne({ email }).select("+password")

        if (!user) {
            return res.status(400).json({
                success: false,
                message: "User does not exist",
            })
        }
        const isMatch = await user.matchPassword(password)

        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "Incorrect Password"
            });
        }

        const token = await user.generateToken();

        const options = {
            expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 100),
            httpOnly: true,
        };

        res.status(200).cookie("token", token, options).json({
            success: true,
            user,
            token
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
}


exports.logout=async (req,res)=>{
    try {
        res.status(200)
        .cookie("token",null,{expires:new Date(Date.now()),httpOnly:true})
        .json({
            success:true,
            message:"Logged out",
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
        
    }
}


exports.followUser = async (req, res) => {
    try {
        const userToFollew = await user_model.findById(req.params.id)

        const loggedInUser = await user_model.findById(req.user._id)


        if (!userToFollew) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            })
        }

        if (loggedInUser.following.includes(userToFollew._id)) {
            const indexfollowing = loggedInUser.following.indexOf(userToFollew._id)
            const indexfollowers = userToFollew.followers.indexOf(loggedInUser._id)

            loggedInUser.following.splice(indexfollowing);
            userToFollew.followers.splice(indexfollowers);

            await loggedInUser.save();
            await userToFollew.save();


            res.status(200).json({
                success: true,
                message: "User Unfollowed",
            })

        } else {
            loggedInUser.following.push(userToFollew._id);
            userToFollew.followers.push(loggedInUser._id);
            await loggedInUser.save();
            await userToFollew.save()
            res.status(200).json({
                success: true,
                message: "User followed",
            })

        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}



exports.updatePassword=async (req,res)=>{
    try {
        const user=await user_model.findById(req.user._id).select("+password");

        const  {oldPassword,newPassword}=req.body;

        if(!oldPassword || !newPassword){
            return res.status(400).json({
                success:false,
                message:"Please provide old and new password",
            })
        }

        const isMatch=await user.matchPassword(oldPassword);
        if(!isMatch){
            return res.status(400).json({
                success:false,
                message:"Incorrect Old password",
            })
        }
        user.password=newPassword;
        await user.save();
        res.status(200).json({
            success:true,
            message:"Password updated"
        })

    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
}


exports.updateProfile=async (req,res)=>{
    try {
        const user=await user_model.findById(req.user._id)

        const {name,email}=req.body

        if(name){
            user.name=name
        }
        if(email){
            user.email=email
        }

        await user.save();

        res.status(200).json({
            success:true,
            message:"Profile Updated"
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })   
    }     
}

exports.deleteMyProfile=async (req,res)=>{
    try {
        const user=await user_model.findById(req.user._id);
        const posts=user.posts;
        const followers=user.followers
        const following=user.following
        const userId=user._id;

        // await user.remove();
        await user_model.findByIdAndRemove(req.user._id)
    

        //logout user after deleting profile
        res.cookie("token",null,{expires:new Date(Date.now()),httpOnly:true});


        //Delete all posts of the user
        for(let i=0;i<posts.length;i++){
            const post=await post_model.findById(posts[i])
            await post_model.findByIdAndRemove(posts[i])
        }

        //Removing User from follwers following
        for(let i=0;i<followers.length;i++){
            const follower=await user_model.findById(followers[i]);
            const index=follower.following.indexOf(userId);
            follower.following.splice(index,1)
            await follower.save();
        }

        //Removing User from follwing's followers 
        for(let i=0;i<following.length;i++){
            const follows=await user_model.findById(following[i]);
            const index=follows.followers.indexOf(userId);
            follows.followers.splice(index,1)
            await follows.save();
        }

        res.status(200).json({
            success:true,
            message:"Profile Deleted",
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        });
    }
};


exports.myProfile=async (req,res)=>{
    try {
        const user=await user_model.findById(req.user._id).populate("posts")

        res.status(200).json({
            success:true,
            user,
        })

        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
        
    }
}


exports.getUserProfile=async (req,res)=>{
    try {
        const user=await user_model.findById(req.params.id);
        if(!user){
            return res.status(404).json({
                success:false,
                message:"User not found"
            });
        }

        res.status(200).json({
            success:true,
            user,
        })

        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        })
    }
}

exports.getAllUsers=async (req,res)=>{
    try {
        const users=await user_model.find({});
        res.status(200).json({
            success:true,
            users,
        })
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}


exports.forgotPassword=async (req,res)=>{
    try {

        const user=await user_model.findOne({email:req.body.email})

        if(!user){
            return res.status(404).json({
                success:false,
                message:"user not found",
            })
        }

        const resetPasswordToken=user.getResetPasswordToken();

        await user.save()
        const resetUrl=`${req.protocol}://${req.get("host")}/api/v1/password/reset/${resetPasswordToken}`

        const message=`Reset Your Password By clicking on the link below:\n\n ${resetUrl}`;

        try {
            await sendEmail({
                email:user.email,
                subject:"Reset Password",
                message
            });
            res.status(200).json({
                success:true,
                message:`Email sent to ${user.email}`
            });
        } catch (error) {
            user.resetPasswordToken=undefined;
            user.resetPasswordExpire=undefined;
            await user.save();

            res.status(500).json({
                success:false,
                message:error.message,
            })
            
        }
        
    } catch (error) {
        res.status(500).json({
            success:false,
            message:error.message
        });
        
    }
}