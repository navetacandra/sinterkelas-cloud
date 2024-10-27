<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { logout } from "../utils/user.js";

  onMount(async () => {
    try {
      await logout();
      return navigate('/login');
    } catch(error) {
      alert(error);
      return navigate('/dashboard');
    }
  });
</script>
