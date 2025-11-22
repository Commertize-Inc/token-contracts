import { EntityManager, MikroORM, RequestContext } from "@mikro-orm/core";
import config from "./config";

let orm: MikroORM | undefined;

export async function getORM() {
	if (!orm) {
		orm = await MikroORM.init(config);
	}
	return orm;
}

export async function getEM() {
	const ormInstance = await getORM();
	return ormInstance.em.fork();
}

export async function withORM<T>(callback: (em: EntityManager) => Promise<T>): Promise<T> {
	const ormInstance = await getORM();
	return RequestContext.create(ormInstance.em.fork(), callback);
}
