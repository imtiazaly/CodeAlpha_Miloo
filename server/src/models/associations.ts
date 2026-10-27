import User from "./User/User.js";
import Post from "./Post/Post.js";
import Comment from "./Comment/Comment.js";
import Like from "./Like/Like.js";
import Follow from "./Follow/Follow.js";

// User - Post
User.hasMany(Post, { foreignKey: "userId", as: "posts" });
Post.belongsTo(User, { foreignKey: "userId", as: "author" });

// User - Comment
User.hasMany(Comment, { foreignKey: "userId", as: "comments" });
Comment.belongsTo(User, { foreignKey: "userId", as: "author" });

// Post - Comment
Post.hasMany(Comment, { foreignKey: "postId", as: "comments" });
Comment.belongsTo(Post, { foreignKey: "postId", as: "post" });

// User - Like
User.hasMany(Like, { foreignKey: "userId", as: "likes" });
Like.belongsTo(User, { foreignKey: "userId", as: "user" });

// Post - Like
Post.hasMany(Like, { foreignKey: "postId", as: "likes" });
Like.belongsTo(Post, { foreignKey: "postId", as: "post" });

// User - Follow
User.hasMany(Follow, {
  foreignKey: "followerId",
  as: "followingRelations",
});
User.hasMany(Follow, {
  foreignKey: "followingId",
  as: "followerRelations",
});

Follow.belongsTo(User, {
  foreignKey: "followerId",
  as: "follower",
});
Follow.belongsTo(User, {
  foreignKey: "followingId",
  as: "following",
});
