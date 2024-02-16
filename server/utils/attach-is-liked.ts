import { IStrapi } from "strapi-typed";

declare const strapi: IStrapi | any;
export default async (commentID:number, currentUser:any) => {
  const isLiked = await strapi.db
    .query("api::like.like")
    .findOne({ where: { $and: [{ commentID: { $eq: commentID } }, { owner: { id: currentUser.id } }] } });

  return !!isLiked;
};
