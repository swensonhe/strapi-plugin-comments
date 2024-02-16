import { StrapiContext, StrapiRequestContextState } from "strapi-typed";

import attachIsLiked from "../utils/attach-is-liked";
// eslint-disable-next-line no-unused-vars
export default () => {
  return async (
    ctx: StrapiContext | StrapiRequestContextState | any,
    next: any
  ) => {
    await next();
    const currentUser = ctx.state.user;

    let data = ctx.response.body?.data;

    if (!data) data = ctx.response.body;

    if (Array.isArray(data) && data.length > 0) {
      data = await Promise.all(
        data.map(async (item) => {
          const isLiked = await attachIsLiked(item.id, currentUser);
          return { ...item, isLiked };
        })
      );
    } else if (!Array.isArray(data) && data?.id) {
      const isLiked = await attachIsLiked(data.id, currentUser);
      data = { ...data, isLiked };
    }
    ctx.response.body = data;
  };
};
