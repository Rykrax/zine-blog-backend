import Post from "../model/post.js";
import { generateUniqueSlug } from "../util/slug.js";
import { paginate } from "../util/paginate.js";

const createPostService = async (data) => {
    const {
        title,
        content,
        thumbnail,
        is_published,
        author
    } = data;

    if (!data.thumbnail) {
        throw new Error("Thiếu thumbnail");
    }
    const slug = await generateUniqueSlug(data.title);

    return await Post.create({
        title,
        slug,
        content,
        thumbnail,
        is_published,
        author
    });
};

const getAllPostByIdService = async (user_id, query) => {
    return await paginate({
        model: Post,
        query: { author: user_id },
        page: query.page,
        limit: query.limit,
        sort: { createdAt: -1 },
        // populate: {
        //     path: "author",
        //     select: "username email"
        // }
    });
};

const getAllPostService = async (query) => {
    return await paginate({
        model: Post,
        page: query.page,
        limit: query.limit,
        sort: { createdAt: -1 },
        populate: {
            path: "author",
            select: "username avatar"
        }
    });
};

const getPostDetailService = async (slug) => {
    const post = await Post.findOne({ slug, is_published: true }).populate("author", "username avatar bio");
    return post;
}

export const postService = {
    createPostService,
    getAllPostService,
    getPostDetailService
};
