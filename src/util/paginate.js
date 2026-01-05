export const paginate = async ({
    model,
    query = {},
    page = 1,
    limit = 10,
    sort = { createdAt: -1 },
    populate = null,
    select = null
}) => {
    page = Math.max(parseInt(page) || 1, 1);
    limit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);

    const skip = (page - 1) * limit;

    let findQuery = model
        .find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit);

    if (select) {
        findQuery = findQuery.select(select);
    }

    if (populate) {
        findQuery = findQuery.populate(populate);
    }

    const [items, total] = await Promise.all([
        findQuery,
        model.countDocuments(query)
    ]);

    return {
        items,
        pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        }
    };
};
