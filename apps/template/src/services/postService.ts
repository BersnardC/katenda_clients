// src/services/postService.ts
import api from "./api";

export const postService = {
  listPublic: () => api.get("/posts"), // GET /posts -> públicos
  create: (payload: { title: string; body: string }) => api.post("/posts", payload),
  getById: (id: string | number) => api.get(`/posts/${id}`),
};
