import { RequestContext } from "@mikro-orm/core";
import { createMiddleware } from "hono/factory";
import { initORM } from "../db";

export const dbMiddleware = createMiddleware(async (c, next) => {
	console.time("InitORM");
	const orm = await initORM();
	console.timeEnd("InitORM");
	return RequestContext.create(orm.em, next);
});
