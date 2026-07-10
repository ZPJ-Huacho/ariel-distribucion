export const productKeys = {
  all: ["products"] as const,
  list: (filters?: { category?: string }) =>
    [...productKeys.all, "list", filters ?? {}] as const,
};
