import { IStrapi } from "strapi-typed";
import extractCollectionName from "./extract-collection-name";
declare const strapi: IStrapi | any;

export default async (commentID:number, data:any) => {
  const comment = await strapi.db.query("plugin::comments.comment").findOne({ where: { id: commentID } });
  const { apiName, recordID } = extractCollectionName(comment.related);
  let oldRecord;
  oldRecord = await strapi.db.query(apiName).findOne({
    where: {
      id: recordID,
    },
  });
  if ((comment.blocked === false && data.blocked === true) || (comment.removed === null && data.removed === true)) {
    if (oldRecord.commentsCount === undefined) {
      return;
    }
    if (oldRecord.commentsCount === null) {
      oldRecord.commentsCount = 0;
    } else {
      oldRecord.commentsCount = oldRecord.commentsCount - 1;
      if (oldRecord.commentsCount < 0) {
        oldRecord.commentsCount = 0;
      }
    }
  }
  if (comment.blocked === true && data.blocked === false) {
    // increase comments count
    if (oldRecord.commentsCount === undefined) {
      return;
    }
    if (oldRecord.commentsCount === null) {
      oldRecord.commentsCount = 1;
    } else {
      oldRecord.commentsCount = oldRecord.commentsCount + 1;
    }
  }
  await strapi.db.query(apiName).update({
    where: {
      id: recordID,
    },
    data: {
      commentsCount: oldRecord.commentsCount,
    },
  });
};
