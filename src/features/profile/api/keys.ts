export const profileKeys = {
  all: ["profile"] as const,
  me: () => [...profileKeys.all, "me"] as const,
  myOrders: () => [...profileKeys.all, "myOrders"] as const,
};
