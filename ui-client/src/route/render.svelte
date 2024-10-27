<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";

  export let guest;
  export let authenticated;

  let auth = false;
  onMount(async () => {
    const token = await window.db.getData('user', 'token');
    auth = !!token;
  });
</script>

{#if !auth}
  <svelte:component this={guest} />
{/if}
{#if auth}
  <svelte:component this={authenticated} />
{/if}
