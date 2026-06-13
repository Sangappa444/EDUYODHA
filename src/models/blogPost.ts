import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBlogPost extends Document {
  title: string;
  slug: string;
  content: string;
  metaDescription: string;
  tags: string[];
  thumbnail: string;
  createdAt: Date;
}

const BlogPostSchema: Schema<IBlogPost> = new Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  metaDescription: { type: String, required: true },
  tags: [{ type: String }],
  thumbnail: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const BlogPost: Model<IBlogPost> = mongoose.models.BlogPost || mongoose.model<IBlogPost>('BlogPost', BlogPostSchema);
export default BlogPost;
