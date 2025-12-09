import { MikroORM, EntityManager } from "@mikro-orm/core";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { mikroOrmConfig as config } from "@commertize/data";

let orm: MikroORM<PostgreSqlDriver>;

export async function getORM(): Promise<MikroORM<PostgreSqlDriver>> {
	if (!orm) {
		orm = await MikroORM.init<PostgreSqlDriver>(config);
	}
	return orm;
}

export async function getEM(): Promise<EntityManager> {
	const orm = await getORM();
	return orm.em.fork();
}

/**
 * @deprecated Use getORM or getEM instead for MikroORM access.
 * Included to minimize breakage during refactor, but note return type change.
 */
export async function getPool() {
	throw new Error("getPool is deprecated. Use getORM or getEM.");
}
