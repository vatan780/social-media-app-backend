const express=require("express");
const { register, login, followUser, logout, updatePassword, updateProfile, deleteMyProfile, myProfile, getUserProfile, getAllUsers, forgotPassword } = require("../controllers/user_controller");
const {isAuthenticated}=require("../middlewares/auth")

const router=express.Router();


router.route("/register").post(register)
router.route("/login").post(login)
router.route("/logout").get(logout)

router.route("/follow/:id").get(isAuthenticated,followUser)

router.route("/update/password").put(isAuthenticated,updatePassword)
router.route("/update/profile").put(isAuthenticated,updateProfile)

router.route("/delete/me").delete(isAuthenticated,deleteMyProfile)
router.route("/myprofile").get(isAuthenticated,myProfile)


router.route("/user/:id").get(isAuthenticated,getUserProfile)
router.route("/getAllUsers").get(isAuthenticated,getAllUsers)

router.route("/forgot/password").post(isAuthenticated,forgotPassword)



module.exports=router