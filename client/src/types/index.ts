export interface User {
  id: number;
  username: string;
  email?: string;
  bio: string | null;
  profileImage: string | null;
  createdAt?: string;
}

export interface Post {
  id: number;
  userId: number;
  content: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
  author: {
    id: number;
    username: string;
    profileImage: string | null;
  };
}

export interface Comment {
  id: number;
  userId: number;
  postId: number;
  content: string;
  createdAt: string;
  author: {
    id: number;
    username: string;
    profileImage: string | null;
  };
}

export interface UserProfile extends User {
  followersCount: number;
  followingCount: number;
  posts: Post[];
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}