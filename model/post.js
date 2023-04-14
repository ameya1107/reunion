const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      Description: { type: String, max: 500 },
      Title: { type: String },
      likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
      comment: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    },
    { timestamps: true }
  );
  
  module.exports = mongoose.model("Post", postSchema);
