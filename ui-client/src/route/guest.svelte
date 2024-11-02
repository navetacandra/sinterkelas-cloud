<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";

  export let component;

  let auth = true;
  onMount(async () => {
    const token = await window.db.getData("user", "token");
    if (!!token) navigate("/drive");
    auth = !!token;
  });
</script>

{#if !auth}
  <svelte:component this={component} />
{/if}
