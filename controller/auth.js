const bcrypt = require("bcrypt");

const jwt = require("jsonwebtoken");

const User = require("../model/user");
const mongoose = require('mongoose');
const Post = require("../model/post");
const Comment = require("../model/comment");

exports.register = async (req, res) => {

  try {
   
    const { firstName, lastName, email, password } = req.body;
    
    if (!(firstName && lastName && email && password)) {
      res.status(404).send("All fields are required");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res.status(401).send("User already exist");
    }

    const encPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      firstName,
      lastName,
      email: email.toLowerCase(),
      password: encPassword,
    });

    user.password = undefined;

    res.status(201).json(user);
  } catch (e) {
    console.log(e);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
      //token
      const token = jwt.sign(
        { user_id: user._id, email },
        process.env.SECRET_KEY,
        {
          expiresIn: 30 * 60 * 60,
        }
      );

      user.password = undefined;
      
      // Setting Up cookies
      const options = {
        expires: new Date(Date.now() + 30 * 60 * 60 * 1000),
        httpOnly: true,
      };

      return res.status(200).cookie("token", token, options).json({
        success: true,
        token,
      });
    }

    res.status(400).send("Email or password incorrect");
  } catch (e) {
    console.log(e);
  }
};


exports.follow= async (req,res)=>{
  try{
 const {id} =req.params;
 let {email}=req.userData;
 const user = await User.findOne({ email });
//  const objectId = mongoose.Types.ObjectId(id);
 // check whether the user id is actual or not 
 if(id.length!=24){
  return res.json({
    msg:"id Invalid"
  })
 }

 const persontobefollowed=await User.findById(id); 
 if(persontobefollowed){
  // check whether the user is trying to following himself  or not
  if(id==user._id){
    return res.json({
      msg:"same persion cannot follow itself",
     });
   }
   else{
    if (!user?.followings.includes(persontobefollowed._id)) {
      await user.updateOne({
        $push: { followings: persontobefollowed._id },
      });
      await persontobefollowed.updateOne({
        $push: { followers: user._id },
      });
      return res.status(200).json({
        msg: "user has been followed",
      });
    } else {
      res.status(400).json({
        msg: "you allready follow this user",
      });
    }

   }   
 }else{
  return res.json({
    msg:"person does not exit "
  })
 }
}
catch (e) {
  res.status(500).send({
    status: "failure",
    message: e.message,
  });
}

}

exports.unfollow= async (req,res)=>{
  try{
 const {id} =req.params;
 let {email}=req.userData;
 const user = await User.findOne({ email });
//  const objectId = mongoose.Types.ObjectId(id);
 // check whether the user id is actual or not 
 if(id.length!=24){
  return res.json({
    msg:"id Invalid"
  })
 }

 const persontobeunfollowed=await User.findById(id); 
 if(persontobeunfollowed){
  // check whether the user is trying to following himself  or not
  if(id==user._id){
    return res.json({
      msg:"same persion cannot unfollow itself",
     });
   }
   else{
    if (user?.followings.includes(persontobeunfollowed._id)) {
      await user.updateOne({
        $pull: { followings: persontobeunfollowed._id },
      });
      await persontobeunfollowed.updateOne({
        $pull: { followers: user._id },
      });
      return res.status(200).json({
        msg: "user has been unfollowed",
      });
    } else {
      res.status(400).json({
        msg: "you don't follow this user",
      });
    }

   }   
 }else{
  return res.json({
    msg:"person does not exit "
  })
 }
}
catch (e) {
  res.status(500).send({
    status: "failure",
    message: e.message,
  });
}

}

exports.getUser=async (req, res) => {
  try {
    const {email}=req.userData;
    const user = await User.findOne({ email:email });

    res.status(200).send({
      status: "success",
      message: "user info",
      UserName:user.firstName+user.lastName,
      "number of followers" :user.followers.length,
     followings:user.followings.length,
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};




// post controllers 
exports.createPost = async (req, res) => {
  let {user_id}=req.userData;
  const newPost = new Post(req.body);
  try {
    newPost.user=user_id;
    await newPost.save();
    newPost.likes=undefined;
    newPost.comment=undefined;
    newPost.user=undefined;
    res.status(200).send({
      status: "success",
      message: "Post has been created",
      newPost
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const {postid}=req.params;
    
    const post = await Post.findById(postid);
    if (postid==post?._id) {
      await Comment.deleteMany({post:postid});
      await Post.findByIdAndDelete(postid);
      res.status(200).send({
        status: "success",
        message: "article has been deleted",
      });
    } else {
      res.status(401).send({
        status: "failure",
        message: "this id for post does not exists",
      });
    }
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};

exports.likePost=async(req,res)=>{
  try {
    console.log("liked post")
    const post= await Post.findById(req.params.postid);
    if (!post.likes.includes(req.userData._id)) {
      await post.updateOne({ $push: { likes: req.userData.user_id } });
      res.status(200).json({
        status: "success",
        message: "the post has been liked",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "this post is already liked ",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: "failure",
      message: error.message,
    });
  }
}

exports.unlikePost=async(req,res)=>{
  try {
    console.log("liked post")
    const post= await Post.findById(req.params.postid);
    if (post.likes.includes(req.userData._id)) {
      await article.updateOne({ $pull: { likes: req.user._id } });
      res.status(200).json({
        status: "success",
        message: "the post has been disliked",
      });
    } else {
      res.status(200).json({
        status: "success",
        message: "this post is already disliked ",
      });
    }
  } catch (error) {
    res.status(500).send({
      status: "failure",
      message: error.message,
    });
  }
}

exports.comment= async (req, res) => {
  try {
    const {comment} = req.body;
    const {postid}=req.params;   
    const commenttosave = new Comment(comment);
    commenttosave.user=req.userData.user_id; 
    const savedcomment = await commenttosave.save();
    await Post.findOneAndUpdate(
      { _id: postid},
      { $push: { comment: savedcomment._id } }
    );
    res.status(200).json({
      status: "success",
      message: "Comment has been created",
      "Comment-ID":savedcomment._id
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};

exports.allposts= async (req, res) => {
  try {
    const posts=await Post.find();
    res.status(200).json({
      status: "success",
      posts
    });
  } catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
  }
};

exports.getpostbyid=async(req,res)=>{
  console.log("hit post by id ");
  try{
    const post=await Post.findById(req.params.postid);
    post.likes=post.likes.length;
    console.log(post);
    res.json({
      message:"post by id ",
      post
    })
  }
  catch (e) {
    res.status(500).send({
      status: "failure",
      message: e.message,
    });
}
};