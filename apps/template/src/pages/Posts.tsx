// src/pages/Posts.tsx
import { useEffect, useState } from "react";
//import { postService } from "../services/postService";

type Post = { id: number; title: string; body: string; author?: any };

export default function Posts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    /* (async () => {
      try {
        const res = await postService.listPublic();
        setPosts(res.data.posts || res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })(); */
    setTimeout(() => {
      setPosts([{id: 1, title: 'First Post', body: 'Excelent post'}, {id: 2, title: 'Second Post', body: 'A great post'}]);
      setLoading(false);
    }, 500)
  }, []);

  if (loading) return <div>Cargando posts...</div>;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Posts públicos</h1>
      <div className="space-y-4">
        {posts.map(p => (
          <article key={p.id} className="border p-4 rounded">
            <h2 className="font-bold">{p.title}</h2>
            <p className="text-sm text-gray-700 mt-2">{p.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
