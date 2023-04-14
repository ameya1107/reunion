const express = require("express");
const router = express.Router();

const controller = require('../controller/auth');//Requring Controllers
const { valToken } = require("../middleware/auth");

router.post("/register", controller.register);

router.post("/authenticate", controller.login);
router.post("/follow/:id",valToken, controller.follow);
router.post("/unfollow/:id",valToken, controller.unfollow);
router.get("/user",valToken, controller.getUser);

// post routes 

router.post("/posts",valToken, controller.createPost);
router.delete("/posts/:postid",valToken, controller.deletePost);
router.post("/like/:postid",valToken, controller.likePost);
router.post("/unlike/:postid",valToken, controller.unlikePost);
router.post("/comment/:postid",valToken, controller.comment);
router.get("/all_posts",valToken,controller.allposts);
router.get("/posts/:postid",valToken,controller.getpostbyid);
module.exports = router
