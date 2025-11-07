// controllers/postController.js - Post controller

import asyncHandler from '../middleware/asyncHandler.js';
import Post from '../models/Post.js';
import Category from '../models/Category.js';

// @desc    Get all posts
// @route   GET /api/posts
// @access  Public
export const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  // Build query
  let query = { isPublished: true };

  if (req.query.category) {
    const category = await Category.findOne({ slug: req.query.category });
    if (category) {
      query.category = category._id;
    }
  }

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { content: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const posts = await Post.find(query)
    .populate('author', 'username')
    .populate('category', 'name slug')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await Post.countDocuments(query);

  res.json({
    success: true,
    count: posts.length,
    pagination: {
      page,
      pages: Math.ceil(total / limit),
      total,
    },
    data: posts,
  });
});

// @desc    Get single post
// @route   GET /api/posts/:id
// @access  Public
export const getPost = asyncHandler(async (req, res) => {
  let post;

  // Check if it's a valid ObjectId or a slug
  if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
    post = await Post.findById(req.params.id)
      .populate('author', 'username')
      .populate('category', 'name slug')
      .populate('comments.user', 'username');
  } else {
    post = await Post.findOne({ slug: req.params.id })
      .populate('author', 'username')
      .populate('category', 'name slug')
      .populate('comments.user', 'username');
  }

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  // Increment view count
  await post.incrementViewCount();

  res.json({
    success: true,
    data: post,
  });
});

// @desc    Create new post
// @route   POST /api/posts
// @access  Private
export const createPost = asyncHandler(async (req, res) => {
  // Add user to req.body
  req.body.author = req.user.id;

  const post = await Post.create(req.body);

  res.status(201).json({
    success: true,
    data: post,
  });
});

// @desc    Update post
// @route   PUT /api/posts/:id
// @access  Private
export const updatePost = asyncHandler(async (req, res) => {
  let post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  // Make sure user is post owner or admin
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to update this post',
    });
  }

  post = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.json({
    success: true,
    data: post,
  });
});

// @desc    Delete post
// @route   DELETE /api/posts/:id
// @access  Private
export const deletePost = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  // Make sure user is post owner or admin
  if (post.author.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Not authorized to delete this post',
    });
  }

  await Post.findByIdAndDelete(req.params.id);

  res.json({
    success: true,
    data: {},
  });
});

// @desc    Add comment to post
// @route   POST /api/posts/:id/comments
// @access  Private
export const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const postId = req.params.id;

  const post = await Post.findById(postId);

  if (!post) {
    return res.status(404).json({
      success: false,
      error: 'Post not found',
    });
  }

  await post.addComment(req.user.id, content);

  res.status(201).json({
    success: true,
    data: post,
  });
});