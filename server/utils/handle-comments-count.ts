import { IStrapi } from "strapi-typed";
import  extractCollectionName from "./extract-collection-name"

declare const strapi: IStrapi | any

export default async (result:any) => {
  const { apiName, recordID } = extractCollectionName(result.related);
  let oldRecord;
  if (!apiName || !recordID) {
    return;
  }
  oldRecord = await strapi.db.query(apiName).findOne({
    where: {
      id: recordID,
    },
  });
  if (oldRecord.commentsCount === undefined) {
    return;
  }
  oldRecord.commentsCount = oldRecord.commentsCount ? oldRecord.commentsCount + 1 : 1;
  strapi.db.query(apiName).update({
    where: {
      id: recordID,
    },
    data: {
      commentsCount: oldRecord.commentsCount,
    },
  });
};
