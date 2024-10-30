<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";

  export let component;

  let auth = false;
  onMount(async () => {
    const token = await window.db.getData("user", "token");
    if (!token) navigate("/login");
    auth = !!token;
  });
</script>

{#if auth}
  <svelte:component this={component} />
{/if}
