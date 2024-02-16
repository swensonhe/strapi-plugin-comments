import { IStrapi } from "strapi-typed";

declare var strapi: IStrapi | any;

export const extractHashtags = (content: string) => {
  const regex = /(?<=#)\w+/g;
  let hashtags: any = content.match(regex);
  if (!hashtags) return [];
  hashtags = [...new Set(hashtags)];
  return hashtags;
};

export const findOrCreateOneTag = async (tag: string) => {
  const dbTag = await strapi.db.query("api::tag.tag").findOne({
    where: {
      value: { $eq: tag },
    },
  });
  if (dbTag) {
    return dbTag;
  }
  return strapi.db.query("api::tag.tag").create({
    data: {
      value: tag,
    },
  });
};
export const findOrCreateManyTags = (tags: any) => {
  const promises = tags.map((tag: any) => findOrCreateOneTag(tag));
  return Promise.all(promises);
};

export const extractMentions = (content: string) => {
  const regex = /(?<=@)\w+/g;
  let mentions: any = content.match(regex);
  mentions = [...new Set(mentions)];
  return mentions;
};
export const findMention = (mention: string) => {
  return strapi.db.query("plugin::users-permissions.user").findOne({
    where: {
      andrewUser: { $eq: mention },
    },
  });
};

export const findMentions = (mentions: string[]) => {
  return strapi.db.query("plugin::users-permissions.user").findMany({
    where: {
      andrewUser: { $in: mentions },
    },
  });
};

export default async (data: any) => {
  if (!data.content) {
    return data;
  }
  const hashtags = extractHashtags(data.content);
  const tags = await findOrCreateManyTags(hashtags);
  let mentions = extractMentions(data.content);
  mentions = await findMentions(mentions);
	
  data.tags = tags;
  data.mentions = mentions;
  return data;
};
