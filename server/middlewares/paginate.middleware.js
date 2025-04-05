"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.paginate = void 0;
class PaginateFunction {
}
const paginate = (payload, limit, total, page) => {
    const pages = page ? parseInt(page) : 1;
    const start = (pages - 1) * limit + 1;
    const to = (pages - 1) * limit + payload.length;
    const last_page = Math.ceil(total / limit);
    return {
        current_page: pages,
        data: payload,
        from: start,
        to,
        limit,
        last_page,
        total: total
    };
};
exports.paginate = paginate;
