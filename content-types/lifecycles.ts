import handleCommentsCount from "../server/utils/handle-comments-count";
import handleCommentsCountsOnUpdate from "../server/utils/handle-comments-counts-on-update";
import handleTagsMentions from "../server/utils/handleTagMentions";
export default {
  models: ["plugin::comments.comment"],
  async beforeCreate(event:any) {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    const { data } = event.params;
    if (!data.content) {
      return;
    }
    await handleTagsMentions(data);
    return data;
  },
  async afterCreate(event:any) {
    if (process.env.NODE_ENV === "test") {
      return;
    }
    const { result } = event;
    handleCommentsCount(result);
  },
  async beforeUpdate(event:any) {
    const { data, where } = event.params;
    if (!where.id) return;
    const commentID = where.id;
    handleCommentsCountsOnUpdate(commentID, data);
  },
};