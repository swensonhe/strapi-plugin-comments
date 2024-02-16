import { StrapiContext } from "strapi-typed";
import middlewares from "../middlewares/index";

export const useMiddlewares = ({ strapi }: StrapiContext |any) => {
  // if (!canRegister({ strapi })) {
  //   strapi.log.warn(
  //     "[Comments Plugin] Middlewares disabled. Upgrade Strapi to use custom fields."
  //   );

  //   return;
  // }

  strapi.server.use(middlewares.attachIsLikeToComment);
};

// const canRegister = ({ strapi }: StrapiContext) => !!strapi.middlewares;