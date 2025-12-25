import { EntityManager, MikroORM, RequestContext } from "@mikro-orm/core";
import config from "@commertize/data/config";
import { loadEnv } from "@commertize/utils/env-server";

loadEnv();

let orm: MikroORM | undefined;

export async function initORM() {
	if (!orm) {
		const resolvedConfig = await config;
		orm = await MikroORM.init(resolvedConfig);
	}
	return orm;
}

export async function getORM() {
	if (!orm) {
		throw new Error("ORM not initialized. Call initORM() first.");
	}
	return orm;
}

export function getEM() {
	return getORM().then((orm) => orm.em);
}
