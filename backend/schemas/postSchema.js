import { z } from 'zod';

const postSchema = z.object({
  title: z.string()
    .min(1, "Title is required")
    .max(255, "Title must be less than 255 characters")
    .trim(),
  
  content: z.string()
    .min(1, "Content is required")
    .max(10000, "Content must be less than 10,000 characters")
    .trim(),
  
  categoryId: z.number()
    .int("Category ID must be an integer")
    .positive("Category ID must be positive"),
  
  tags: z.array(z.string().trim())
    .optional()
    .default([])
    .transform(tags => tags.filter(tag => tag.length > 0))
});

export default postSchema;