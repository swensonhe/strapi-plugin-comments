import {  StrapiContext } from "strapi-typed";
import { registerCustomFields } from "./custom-fields";

// import { useMiddlewares } from "./register-middlewares";


const register = (context: StrapiContext) => {
  registerCustomFields(context);
	// useMiddlewares(context);
};

export default register;
