import register from "./register";
import bootstrap from "./bootstrap";
import destroy from "./destroy";
import config from "./config";
import controllers from "./controllers";
import routes from "./routes";
import services from "./services";
import attachIsLikeToComment from "./middlewares/attach-is-like-to-comment";

export default {
  register,
  bootstrap,
  destroy,
  config,
  controllers,
  routes,
  services,
  contentTypes: {},
  policies: {},
  middlewares: { attachIsLikeToComment },
};
