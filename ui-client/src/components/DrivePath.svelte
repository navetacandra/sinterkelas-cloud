<script>
  import { Link } from "svelte-routing";
  export let paths;
</script>

<div class="text-xl flex mb-4">
  {#each paths as path}
    <p class="text-black dark:text-white">
      <Link
        class="mx-1 cursor-pointer text-blue-800 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 hover:underline"
        to={`/drive/${path.name ? path.id : ""}`}>{path.name || "Home"}</Link
      >/
    </p>
  {/each}
</div>
