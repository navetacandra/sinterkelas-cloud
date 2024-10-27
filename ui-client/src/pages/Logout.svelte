<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { request } from "../request.js";

  onMount(async () => {
    const token = await window.db.getData('user', 'token');
    if(!token) return navigate('/login');

    try {
      const res = await request('/api/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: null
      });

      if(res.ok) {
        await window.db.clearStore('user');
        return navigate('/login');
      } else {
        const json = await res.json();
        alert(json.message || 'Something went wrong');
        return navigate('/dashboard');
      }
    } catch(err) {
      return navigate('/dashboard');
    }
  });
</script>
