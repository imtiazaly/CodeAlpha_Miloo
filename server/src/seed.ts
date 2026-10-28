import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB, sequelize } from "./config/db.js";
import { User, Post, Comment, Like, Follow } from "./models/index.js";

const TOTAL_USERS = 500;
const TOTAL_POSTS = 5000;
const TOTAL_COMMENTS = 8000;
const TOTAL_LIKES = 12000;
const TOTAL_FOLLOWS = 3000;

const runSeeder = async () => {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });
    console.log("Seeding started...");

    // 1. Hash single password for all test users (Instant speed)
    const passwordHash = await bcrypt.hash("password123", 10);

    // 2. Generate 500 Users
    console.log("Creating 500 users...");
    const usersData = [];
    for (let i = 1; i <= TOTAL_USERS; i++) {
      usersData.push({
        username: `user_${i}`,
        email: `user${i}@miloo.com`,
        password: passwordHash,
        bio: `Hey there! I am user ${i} on Miloo. Enjoying this platform!`,
        profileImage: `https://api.dicebear.com/7.x/identicon/svg?seed=miloo_user_${i}`,
      });
    }
    const createdUsers = await User.bulkCreate(usersData);
    const userIds = createdUsers.map((u) => u.id);

    // 3. Generate Follow Relationships
    console.log("Creating follow relationships...");
    const followSet = new Set<string>();
    const followsData = [];
    while (followsData.length < TOTAL_FOLLOWS) {
      const followerId = userIds[Math.floor(Math.random() * userIds.length)];
      const followingId = userIds[Math.floor(Math.random() * userIds.length)];
      const key = `${followerId}-${followingId}`;

      if (followerId !== followingId && !followSet.has(key)) {
        followSet.add(key);
        followsData.push({ followerId, followingId });
      }
    }
    await Follow.bulkCreate(followsData as any);

    // 4. Generate 5000 Posts (in chunks of 1000)
    console.log("Creating 5000 posts...");
    const postTemplates = [
      "Just finished working on an incredible project! Loving the journey.",
      "Exploring new horizons today. What are your plans for the weekend?",
      "Technology and community coming together. Proud to be on Miloo!",
      "A quick thought for the day: consistency is the true key to mastery.",
      "Check out this amazing view from my trip earlier!",
      "Coffee, code, and good vibes. Have a great day everyone!",
    ];

    const postsData = [];
    for (let i = 1; i <= TOTAL_POSTS; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const hasImage = Math.random() > 0.55;
      postsData.push({
        userId: randomUserId,
        content: `${postTemplates[i % postTemplates.length]} (#post${i})`,
        imageUrl: hasImage
          ? `https://picsum.photos/seed/miloo_post_${i}/800/600`
          : null,
      });
    }
    const createdPosts = await Post.bulkCreate(postsData as any);
    const postIds = (createdPosts as Post[]).map((p) => p.id);

    // 5. Generate Likes
    console.log("Creating likes...");
    const likeSet = new Set<string>();
    const likesData = [];
    while (likesData.length < TOTAL_LIKES) {
      const userId = userIds[Math.floor(Math.random() * userIds.length)];
      const postId = postIds[Math.floor(Math.random() * postIds.length)];
      const key = `${userId}-${postId}`;

      if (!likeSet.has(key)) {
        likeSet.add(key);
        likesData.push({ userId, postId });
      }
    }
    await Like.bulkCreate(likesData as any);

    // 6. Generate Comments
    console.log("Creating comments...");
    const sampleComments = [
      "Great post!",
      "Totally agree with this.",
      "Awesome perspective!",
      "Nice shot!",
      "Keep up the great work!",
      "Interesting, tell us more.",
    ];
    const commentsData = [];
    for (let i = 1; i <= TOTAL_COMMENTS; i++) {
      commentsData.push({
        userId: userIds[Math.floor(Math.random() * userIds.length)],
        postId: postIds[Math.floor(Math.random() * postIds.length)],
        content: sampleComments[i % sampleComments.length],
      });
    }
    await Comment.bulkCreate(commentsData as any);

    console.log("\n=================================");
    console.log("Seeding Completed Successfully!");
    console.log(`Users: ${TOTAL_USERS} (Password: password123)`);
    console.log(`Follows: ${TOTAL_FOLLOWS}`);
    console.log(`Posts: ${TOTAL_POSTS}`);
    console.log(`Likes: ${TOTAL_LIKES}`);
    console.log(`Comments: ${TOTAL_COMMENTS}`);
    console.log("=================================\n");
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

runSeeder();
