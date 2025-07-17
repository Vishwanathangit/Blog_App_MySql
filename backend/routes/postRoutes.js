import express from 'express';
import authenticate from '../middlewares/auth.js';
import {
  getAllPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
  getCategories,
} from '../controllers/postController.js';

const router = express.Router();

router.get('/', getAllPosts);
router.get('/categories', getCategories);
router.get('/:id', getPostById);
router.post('/', authenticate, createPost);
router.put('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

export default router;