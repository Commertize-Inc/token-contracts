import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import type { Listing } from "@commertize/data";

export function useListings() {
	return useQuery({
		queryKey: ["listings"],
		queryFn: async () => {
			return api.get("/listings") as Promise<Listing[]>;
		},
		retry: 2,
	});
}
