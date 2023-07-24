const post_model = require("../models/Post_Models.js");
const user_model = require("../models/User_Models.js")
exports.createPost = async (req, res) => {
    try {
        const newPostData = {
            caption: req.body.caption,
            image: {
                public_id: "req.body.public_id",
                url: "req.body.url",
            },
            owner: req.user._id
        }

        const post = await post_model.create(newPostData);
        const user = await user_model.findById(req.user._id)
        user.posts.push(post._id)
        await user.save()

        res.status(201).json({
            success: true,
            post
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })

    }

}


exports.deletePost = async (req, res) => {
    try {
        const post = await post_model.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found"
            })
        }
        if (post.owner.toString() != req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            })
        }
        console.log(post)

        // await post.remove()
        await post_model.findByIdAndRemove(req.params.id)

        const user = await user_model.findById(req.user._id);
        const index = user.posts.indexOf(req.params.id);
        user.posts.splice(index, 1);
        await user.save()


        res.status(200).json({
            success: true,
            message: "Post deleted",
        })


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


exports.likeAndUnlikePost = async (req, res) => {
    try {
        const post = await post_model.findById(req.params.id);


        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post not found",
            })
        }
        console.log(req.user._id)

        if (post.likes.includes(req.user._id)) {
            const index = post.likes.indexOf(req.user._id)

            post.likes.splice(index, 1);

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post Unliked",
            })
        }
        else {
            post.likes.push(req.user._id);

            await post.save();

            return res.status(200).json({
                success: true,
                message: "Post Liked",
            });
        }


    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })
    }
}


exports.getPostOfFollowing = async (req, res) => {
    try {
        const user = await user_model.findById(req.user._id)


        const posts = await post_model.find({
            owner: {
                $in: user.following,
            },
        });

        res.status(200).json({
            success: true,
            posts,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })

    }
}

exports.updateCaption = async (req, res) => {
    try {
        const post = await post_model.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post Not found",
            });
        }

        if (post.owner.toString() !== req.user._id.toString()) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        post.caption = req.body.caption;
        await post.save();
        res.status(200).json({
            success: true,
            message: "Captions Updated"
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        })

    }
}


exports.commentOnPost = async (req, res) => {
    try {

        const post = await post_model.findById(req.params.id);

        if (!post) {
            return res.status(404).json({
                success: false,
                message: "Post Not Found",
            });
        }
        let commentIndex=-1;
        post.comments.forEach((item,index)=>{
            console.log(item.user.toString())
            if(item.user.toString()===req.user._id.toString()){
                commentIndex=index;
            }
        })

        if(commentIndex !== -1){
            post.comments[commentIndex].comment=req.body.comment

            await post.save();

            return res.status(200).json({
                success:true,
                message:"Comment Updated",
            });

        }else{
            post.comments.push({
                user: req.user._id,
                comment: req.body.comment,
            });

            await post.save()

            res.status(200).json({
                success:true,
                message:"Comment added",
            })
        }

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        })

    }
}

exports.deleteComment=async (req,res)=>{
    try {
        const post =await post_model.findById(req.params.id);

        if(!post){
            return res.status(404).json({
                success:false,
                message:"Post Not Found",
            });
        }

        if (post.owner.toString()===req.user._id.toString()){

            if(req.body.commentId==undefined){
                return res.status(400).json({
                    success:false,
                    message:"Comment Id is required"
                })
            }
            post.comments.forEach((item,index)=>{
                if(item._id.toString()===req.body.commentId.toString()){
                    return post.comments.splice(index,1)
                }
            });

            await post.save();

            res.status(200).json({
                success:true,
                message:"Selected comment has deleted",
            });

           

        }else{
            post.comments.forEach((item,index)=>{
                if(item.user.toString()===req.user._id){
                    return post.comments.splice(index,1)
                }
            });

            await post.save();

            res.status(200).json({
                success:true,
                message:"Your comment deleted",
            });
        }
    } catch (error) {
        res.status(500).json({
            success:true,
            message:error.message,
        })
        
    }
}