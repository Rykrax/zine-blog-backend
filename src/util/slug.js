import slugify from "slugify";
import Post from "../model/post.js";

export const generateUniqueSlug = async (title) => {
    const baseSlug = slugify(title, {
        lower: true,
        strict: true,
        locale: "vi"
    });

    let slug = baseSlug;
    let count = 1;

    while (await Post.exists({ slug })) {
        slug = `${baseSlug}-${count}`;
        count++;
    }

    return slug;
};
