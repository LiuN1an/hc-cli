export const fetcher = async (api: string, option = {}) => {
  const baseURL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : typeof window !== "undefined"
      ? window.location.origin
      : process.env.VERCEL_URL;
  const res = await fetch(`${baseURL}${api}`, {
    ...option,
    method: "post",
  });
  return await res.json();
};
