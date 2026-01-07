import Post from "../model/post.js";
import { generateUniqueSlug } from "../util/slug.js";
import { paginate } from "../util/paginate.js";
import User from "../model/user.js";

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

// const getAllPostService = async (query) => {
//     const filter = {};
//     if (query.author) {
//         filter.author = query.author;
//     }
//     filter.is_published = true;
//     const result = await paginate({
//         model: Post,
//         query: filter,
//         page: query.page,
//         limit: query.limit,
//         sort: { createdAt: -1 },
//         populate: {
//             path: "author",
//             select: "username avatar"
//         },
//         lean: true
//     });

//     const posts = result.items || [];

//     if (!posts.length) return result;

//     const postIds = posts.map(p => p._id);

//     const savedStats = await User.aggregate([
//         { $unwind: "$saved_posts" },
//         { $match: { saved_posts: { $in: postIds } } },
//         {
//             $group: {
//                 _id: "$saved_posts",
//                 count: { $sum: 1 }
//             }
//         }
//     ]);

//     const savedMap = {};
//     savedStats.forEach(i => {
//         savedMap[i._id.toString()] = i.count;
//     });

//     result.items = posts.map(post => ({
//         ...post.toObject(),
//         saved_count: savedMap[post._id.toString()] || 0
//     }));

//     return result;
// };

const getAllPostService = async (query) => {
    const filter = {};
    if (query.author) {
        filter.author = query.author;
    }
    filter.is_published = true;
    return await paginate({
        model: Post,
        query: filter,
        page: query.page,
        limit: query.limit,
        sort: { createdAt: -1 },
        populate: {
            path: "author",
            select: "username avatar"
        },
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
