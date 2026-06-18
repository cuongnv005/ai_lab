import axios from 'axios';
import { PostListSchema } from './features/posts/schemas/post.schema';

async function test() {
  try {
    const res = await axios.get('http://localhost:8000/api/posts');
    console.log("Response data structure keys:", Object.keys(res.data));
    console.log("Success:", res.data.success);
    console.log("Data length:", res.data.data?.length);
    
    const posts = res.data.data || [];
    const result = PostListSchema.safeParse(posts);
    if (result.success) {
      console.log("Real API Data validation Succeeded!");
    } else {
      console.error("Real API Data validation Failed!");
      console.error(JSON.stringify(result.error.format(), null, 2));
    }
  } catch (err: any) {
    console.error("Error fetching/testing:", err.message);
  }
}

test();
