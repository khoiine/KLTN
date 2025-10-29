import mongoose from "mongoose";

const blogSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    excerpt: { type: String, required: true },
    content: { type: String, required: true },
    image: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
    authorName: { type: String, required: true },
    category: { type: String, required: true },
    tags: [{ type: String }],
    status: { type: String, enum: ['draft', 'published'], default: 'draft' },
    views: { type: Number, default: 0 },
    featured: { type: Boolean, default: false }
}, { timestamps: true });

const blogModel = mongoose.models.blog || mongoose.model("blog", blogSchema);

export default blogModel;