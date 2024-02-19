import {
  Comment,
  CommentReport,
  CreateCommentPayload,
  CreateCommentReportPayload,
  IControllerClient,
  Id,
  IServiceClient,
  IServiceCommon,
  ThrowablePromisedResponse,
  ToBeFixed,
  UpdateCommentPayload,
} from "../../types";
import {IStrapi, StrapiPaginatedResponse, StrapiRequestContext,} from "strapi-typed";

import {assertNotEmpty, assertParamsPresent, getPluginService,} from "../utils/functions";
import {parseParams, throwError} from "./utils/functions";
import {flatInput} from "./utils/parsers";
import PluginError from "../utils/error";
import {AUTHOR_TYPE} from "../utils/constants";
import idExtractor from "../utils/id-extractor";
import attachLikesToComments from "../utils/attach-likes";
import extractCollectionName from "../utils/extract-collection-name";

declare const strapi: IStrapi | any;

const controllers: IControllerClient = {
  getService(name = "client") {
    return getPluginService(name);
  },

  async findAllFlat(
    this: IControllerClient,
    ctx: StrapiRequestContext<never, ToBeFixed>
  ): ThrowablePromisedResponse<StrapiPaginatedResponse<Comment>> {
    const { params = {}, query, sort, pagination } = ctx;
    const { relation } = parseParams<{ relation: string }>(params);

    const {
      sort: querySort,
      pagination: queryPagination,
      fields,
      ...filterQuery
    } = query || {};

    try {
      assertParamsPresent<{ relation: string }>(params, ["relation"]);

      return this.getService<IServiceCommon>("common").findAllFlat(
        flatInput({
          relation,
          query: filterQuery,
          sort: sort || querySort,
          pagination: pagination || queryPagination,
          fields,
        })
      );
    } catch (e: ToBeFixed) {
      throw throwError(ctx, e);
    }
  },

  async findAllInHierarchy(
    this: IControllerClient,
    ctx: StrapiRequestContext<never, ToBeFixed>
  ): ThrowablePromisedResponse<Array<Comment>> {
    const { params, query, sort } = ctx;
    const { relation } = parseParams<{ relation: string }>(params);

    const { sort: querySort, fields, ...filterQuery } = query || {};

    try {
      assertParamsPresent<{ relation: string }>(params, ["relation"]);

      return await this.getService<IServiceCommon>("common").findAllInHierarchy(
        {
          ...flatInput<Comment>({
            relation,
            query: filterQuery,
            sort: sort || querySort,
            fields,
          }),
          dropBlockedThreads: true,
        }
      );
    } catch (e: ToBeFixed) {
      throw throwError(ctx, e);
    }
  },
  async findAllInHierarchyWithLikes(
    this: IControllerClient,
    ctx: StrapiRequestContext<never, ToBeFixed>
  ) {
    const hierarchyResult = await this.findAllInHierarchy(ctx);
    const flatResult: any = await this.findAllFlat(ctx);
    const commentsIDs = idExtractor(flatResult?.data);
    const likes = await this.getService<IServiceCommon>("common").fetchCommentsLikes(commentsIDs);
    return attachLikesToComments(
        hierarchyResult as Comment[],
        likes
    );
  },
  async findAllFlatWithLikes(
    this: IControllerClient,
    ctx: StrapiRequestContext<never, ToBeFixed>
  ): Promise<any> {
    const flatResult: any = await this.findAllFlat(ctx);
    const commentsIDs = idExtractor(flatResult?.data);
		
    const likes: any = this.getService<IServiceCommon>("common").fetchCommentsLikes(commentsIDs);

    return attachLikesToComments(
        flatResult?.data as Comment[],
        likes
    );
  },
  async findAllPerAuthor(
    this: IControllerClient,
    ctx: StrapiRequestContext<never, ToBeFixed>
  ): ThrowablePromisedResponse<StrapiPaginatedResponse<Comment>> {
    const { params = {}, query, sort, pagination } = ctx;
    const { id, type } = parseParams<{ id: Id; type: string }>(params);

    const {
      sort: querySort,
      pagination: queryPagination,
      fields,
      ...filterQuery
    } = query || {};

    try {
      assertParamsPresent<{ id: Id }>(params, ["id"]);

      return this.getService<IServiceCommon>("common").findAllPerAuthor(
        flatInput({
          query: filterQuery,
          sort: sort || querySort,
          pagination: pagination || queryPagination,
          fields,
        }),
        id,
        ![AUTHOR_TYPE.GENERIC.toLowerCase(), AUTHOR_TYPE.GENERIC].includes(type)
      );
    } catch (e: ToBeFixed) {
      throw throwError(ctx, e);
    }
  },

  async post(
    this: IControllerClient,
    ctx: StrapiRequestContext<CreateCommentPayload>
  ): ThrowablePromisedResponse<Comment> {
    const { request, params, state = {} } = ctx;
   
    const { relation } = parseParams<{
      relation: string;
    }>(params);
    const { user } = state;
    const { body } = request;
    
    try {
      assertParamsPresent<{ relation: string }>(params, ["relation"]);
      assertNotEmpty<CreateCommentPayload>(body);

      const entity = await this.getService<IServiceClient>().create(
        relation,
        body,
        user
      );

      if (entity) {
        return entity;
      }
      throw new PluginError(400, "Comment hasn't been created");
    } catch (e: ToBeFixed) {
      throw throwError(ctx, e);
    }
  },

  async put(
    this: IControllerClient,
    ctx: StrapiRequestContext<UpdateCommentPayload>
  ): ThrowablePromisedResponse<Comment> {
    const { request, state, params = {} } = ctx;
    const { body } = request;
    const { user } = state;
    const { commentId, relation } = parseParams<{
      relation: string;
      commentId: Id;
    }>(params);
    try {
      assertParamsPresent<{
        relation: string;
        commentId: Id;
      }>(params, ["commentId", "relation"]);
      assertNotEmpty<UpdateCommentPayload>(body);

      return await this.getService<IServiceClient>().update(
        commentId,
        relation,
        body,
        user
      );
    } catch (e: ToBeFixed) {
      throw throwError(ctx, e);
    }
  },

  async reportAbuse(
    this: IControllerClient,
    ctx: StrapiRequestContext<CreateCommentReportPayload>
  ): ThrowablePromisedResponse<CommentReport> {
    const { request, state, params = {} } = ctx;
    const { body } = request;
    const { user } = state;
    const { relation, commentId } = parseParams<{
      relation: string;
      commentId: Id;
    }>(params);

    try {
      assertParamsPresent(params, ["commentId", "relation"]);
      assertNotEmpty<CreateCommentReportPayload>(body);

      if (!body.content) {
        throw new PluginError(400, "Content field is required");
      }
      return await this.getService<IServiceClient>().reportAbuse(
        commentId,
        relation,
        body,
        user
      );
    } catch (e) {
      throw throwError(ctx, e);
    }
  },

  async removeComment(
    this: IControllerClient,
    ctx: StrapiRequestContext<never>
  ): ThrowablePromisedResponse<Comment> {
    const {
      params,
      query,
      state: { user },
    } = ctx;

    const { relation, commentId } = parseParams<{
      relation: string;
      commentId: Id;
    }>(params);
    const { authorId } = parseParams(query);

    try {
      assertParamsPresent<{
        relation: string;
        commentId: Id;
      }>(params, ["commentId", "relation"]);
      assertParamsPresent<{
        authorId: Id;
      }>(query, ["authorId"]);

      if (authorId || user?.id) {
        return await this.getService<IServiceClient>().markAsRemoved(
          commentId,
          relation,
          authorId,
          user
        );
      }
      return new PluginError(400, "Not provided authorId");
    } catch (e: ToBeFixed) {
      if (!e.isBoom) {
        throwError(ctx, e);
      }
      throw e;
    }
  },
  async deleteComment(
    this: IControllerClient,
    ctx: StrapiRequestContext<never, ToBeFixed>
  ) {
    const removedComment: any = await this.removeComment(ctx);
    const { apiName, recordID } = extractCollectionName(removedComment.related);
    if (apiName && recordID) {
      const oldRecord = await strapi.db.query(apiName).findOne({
        where: {
          id: recordID,
        },
      });
      if (oldRecord.commentsCount === undefined) {
        return;
      }
      if (oldRecord.commentsCount === null) {
        oldRecord.commentsCount = 0;
      } else {
        oldRecord.commentsCount = oldRecord.commentsCount - 1;
      }

      if (oldRecord.commentsCount < 0) {
        oldRecord.commentsCount = 0;
      }

      strapi.db.query(apiName).update({
        where: {
          id: recordID,
        },
        data: {
          commentsCount: oldRecord.commentsCount,
        },
      });
    }

    return removedComment;
  },
};

export default controllers;
