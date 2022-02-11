const express = require("express");
//if you dont want to use apollo server together with express:
// const { ApolloServer, gql } = require("apollo-server");
const { ApolloServer, gql } = require("apollo-server-express");
const mongoose = require("mongoose");
const Post = require("./models/Post.model");
const User = require("./models/User.model");

const typeDefs = gql`
  type Post {
    id: ID!
    title: String!
    description: String
  }
  type User {
    id: ID!
    name: String!
    age: Int!
    posts: [Post]
  }
  type Query {
    getAllPosts: [Post]
    getPost(id: ID): Post
    getAllUsers: [User]
    getUser(id: ID): User
  }
  input PostInput {
    title: String
    description: String
  }
  input UserInput {
    name: String
    age: Int
  }
  type Mutation {
    createPost(userId: ID, post: PostInput): Post
    deletePost(id: ID): String
    updatePost(id: ID, post: PostInput): Post
    createUser(user: UserInput): User
    deleteUser(id: ID): String
    updateUser(id: ID, user: UserInput): User
  }
  type Subscription {
    newUser: User
  }
`;

const resolvers = {
  Query: {
    getAllPosts: async () => {
      return await Post.find();
    },
    getPost: async (parent, args, context, info) => {
      const post = await Post.findById(args.id);
      return post;
    },
    getAllUsers: async () => {
      return await User.find().populate("posts");
    },
    getUser: async (parent, args, context, info) => {
      const user = await User.findById(args.id).populate("posts");
      return user;
    },
  },
  Mutation: {
    createPost: async (parent, args, context, info) => {
      const { title, description } = args.post;
      const post = new Post({ title, description });
      await post.save();
      const user = await User.findById(args.userId);
      user.posts.push(post._id);
      await user.save();
      return post;
    },
    deletePost: async (parent, args, context, info) => {
      await Post.findByIdAndDelete(args.id);
      return "post deleted";
    },
    updatePost: async (parent, args, context, info) => {
      const { id } = args;
      let updateFields = {};
      for (param in args.post) {
        updateFields[param] = args.post[param];
      }
      const post = await Post.findByIdAndUpdate(id, updateFields, {
        new: true,
      });
      return post;
    },
    createUser: (parent, args, context, info) => {
      const { name, age } = args.user;
      const user = new User({ name, age });
      user.save();
      return user;
    },
    deleteUser: async (parent, args, context, info) => {
      await User.findByIdAndDelete(args.id);
      return "user deleted";
    },
    updateUser: async (parent, args, context, info) => {
      const { id } = args;
      let updateFields = {};
      for (param in args.post) {
        updateFields[param] = param;
      }
      const user = await User.findByIdAndUpdate(id, updateFields, {
        new: true,
      });
      return user;
    },
  },
  Subscription: {},
};

async function startServer() {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  //!!!first start apollo server, then listen to the port!
  await server.start();
  server.applyMiddleware({ app });
  //server.applyMiddleware({ app, path: '/something' }); //default:'/graphql'

  //connecting mongodb:
  await mongoose.connect("mongodb://localhost:27017/apollo-app");
  console.log("mongoose connected");

  app.use((req, res) => res.send("Hello from server"));

  app.listen(4000, () => console.log("server is running on Port 4000"));
}
startServer();
