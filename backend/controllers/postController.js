import sequelize from '../config/db.js';
import db from '../models/index.js';
import postSchema from '../schemas/postSchema.js';

const { Post, User, Tag, Category } = db;

export const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const offset = (page - 1) * limit;
    const tag = req.query.tag;
    const category = req.query.category;

    let whereClause = '';
    const replacements = [];

    if (category) {
      whereClause += ` AND c.name = ?`;
      replacements.push(category);
    }

    if (tag) {
      whereClause += ` AND t.name = ?`;
      replacements.push(tag);
    }

    const baseQuery = `FROM posts p LEFT JOIN users u ON p.UserId = u.id LEFT JOIN categories c ON p.CategoryId = c.id LEFT JOIN post_tags pt ON p.id = pt.PostId LEFT JOIN tags t ON pt.TagId = t.id WHERE 1=1${whereClause}`;

    const countQuery = `SELECT COUNT(DISTINCT p.id) as total ${baseQuery}`;
    const [countResult] = await sequelize.query(countQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });
    const totalPosts = countResult.total;

    const dataQuery = `
      SELECT
      p.id,
      p.title,
      p.content,
      p.createdAt,
      u.username,
      c.id AS categoryId,
      c.name AS category,
      GROUP_CONCAT(DISTINCT t.name) AS tags
      ${baseQuery}
      GROUP BY p.id
      ORDER BY p.createdAt DESC
      LIMIT ? OFFSET ?
    `;
    replacements.push(limit, offset);

    const posts = await sequelize.query(dataQuery, {
      replacements,
      type: sequelize.QueryTypes.SELECT,
    });

    res.status(200).json({
      posts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id, {
      attributes: ['id', 'title', 'content', 'createdAt', 'updatedAt', 'CategoryId'],
      include: [
        { model: User, attributes: ['username'] },
        { model: Category, attributes: ['name'] },
        { model: Tag, attributes: ['name'], through: { attributes: [] } },
      ],
    });
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.status(200).json(post);
  } catch (error) {
    next(error);
  }
};

export const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
    });
    res.status(200).json(categories);
  } catch (err) {
    next(err);
  }
};

export const createPost = async (req, res, next) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.id) {
      console.error("Missing authenticated user.");
      return res.status(401).json({ message: "Unauthorized: No user info in token." });
    }

    console.log("Request body:", req.body);
    console.log("User from token:", req.user);

    // Validate request data
    let validatedData;
    try {
      validatedData = postSchema.parse(req.body);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      return res.status(400).json({
        message: "Validation failed",
        errors: validationError.errors || validationError.message,
      });
    }

    const { title, content, categoryId, tags = [] } = validatedData;

    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    // Verify category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    // Verify user exists
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    console.log("Creating post with validated data:", {
      title,
      content,
      userId: req.user.id,
      categoryId,
    });

    // Create the post
    const post = await Post.create({
      title,
      content,
      UserId: req.user.id,
      CategoryId: categoryId,
    });

    console.log("Post created successfully:", post.id);

    // Handle tags if provided
    if (tags && tags.length > 0) {
      try {
        const tagInstances = await Promise.all(
          tags.map(async (name) => {
            const trimmedName = name.trim();
            if (!trimmedName) return null;

            const [tag] = await Tag.findOrCreate({ where: { name: trimmedName } });
            return tag;
          })
        );

        // Filter out null tags
        const validTagInstances = tagInstances.filter(tag => tag !== null);

        if (validTagInstances.length > 0) {
          await post.setTags(validTagInstances);
        }
      } catch (tagError) {
        console.error("Tag processing error:", tagError);
        // Continue without tags if tag processing fails
      }
    }

    // Fetch the complete post with associations
    const fullPost = await Post.findByPk(post.id, {
      include: [
        { model: User, attributes: ['username'] },
        { model: Category, attributes: ['name'] },
        { model: Tag, attributes: ['name'], through: { attributes: [] } },
      ],
    });

    console.log("Full post created:", fullPost);

    res.status(201).json(fullPost);
  } catch (err) {
    console.error("CreatePost error:", err);
    console.error("Error stack:", err.stack);

    // Handle specific Sequelize errors
    if (err.name === 'SequelizeValidationError') {
      return res.status(400).json({
        message: "Validation error",
        errors: err.errors.map(e => e.message),
      });
    }

    if (err.name === 'SequelizeUniqueConstraintError') {
      return res.status(400).json({
        message: "A post with this title already exists",
      });
    }

    if (err.name === 'SequelizeForeignKeyConstraintError') {
      return res.status(400).json({
        message: "Invalid foreign key reference",
      });
    }

    res.status(500).json({
      message: "Internal Server Error",
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
    });
  }
};

export const updatePost = async (req, res, next) => {
  try {
    const validatedData = postSchema.parse(req.body);
    const { title, content, categoryId, tags = [] } = validatedData;

    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if user owns the post
    if (req.user && post.UserId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to update this post' });
    }

    // Verify category exists
    const category = await Category.findByPk(categoryId);
    if (!category) {
      return res.status(400).json({ message: "Invalid category ID" });
    }

    await post.update({ title, content, CategoryId: categoryId });

    if (tags.length > 0) {
      const tagInstances = await Promise.all(
        tags.map(async (name) => {
          const trimmedName = name.trim();
          if (!trimmedName) return null;

          const [tag] = await Tag.findOrCreate({ where: { name: trimmedName } });
          return tag;
        })
      );

      const validTagInstances = tagInstances.filter(tag => tag !== null);
      await post.setTags(validTagInstances);
    } else {
      // Clear all tags if none provided
      await post.setTags([]);
    }

    const updatedPost = await Post.findByPk(req.params.id, {
      include: [
        { model: User, attributes: ['username'] },
        { model: Category, attributes: ['name'] },
        { model: Tag, attributes: ['name'], through: { attributes: [] } },
      ],
    });

    res.status(200).json(updatedPost);
  } catch (err) {
    next(err);
  }
};

export const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findByPk(req.params.id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    // Check if user owns the post
    if (req.user && post.UserId !== req.user.id) {
      return res.status(403).json({ message: 'Unauthorized to delete this post' });
    }

    await post.destroy();
    res.status(204).end();
  } catch (err) {
    next(err);
  }
};