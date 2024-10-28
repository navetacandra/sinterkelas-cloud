<script>
  import { onMount } from "svelte";
  import { useLocation } from "svelte-routing";
  import { request } from "../utils/request.js";
  import DrivePath from "../components/DrivePath.svelte";
  import DriveItem from "../components/DriveItem.svelte";
  import DriveTitleSkeleton from "../components/skeleton/DriveTitle.svelte";
  import DriveItemSkeleton from "../components/skeleton/DriveItem.svelte";

  export let id = "";
  const location = useLocation();
  let loading = true;
  let error = false;
  let paths = [];
  let items = [];

  async function getDriveInfo() {
    try {
      const response = await request(`/api/drive/${id}`, {
        method: "POST",
      });
      const json = await response.json();
      const { items: i, path: p } = json.data;
      items = i;
      paths = p;
    } catch (err) {
      console.error(err);
      error = true;
    } finally {
      loading = false;
    }
  }

  $: {
    $location;
    getDriveInfo();
  }
</script>

<div class="px-4 md:px-32 xl:px-64 py-8 mt-5 text-black dark:text-white">
  {#if !loading}
    {#if error}
      <h1 class="text-3xl font-bold mb-2.5 text-center">Drive not found!</h1>
      <p class="text-center text-lg">
        Back to <a
          href="/dashboard"
          class="text-light-primary hover:underline dark:text-dark-primary"
          >home</a
        >
      </p>
    {/if}
    {#if !error}
      <h1 class="text-3xl font-bold mb-2.5">Dashboard</h1>
      <DrivePath {paths} />
      {#each items as item}
        <DriveItem {item} />
      {/each}
    {/if}
  {/if}
  {#if loading}
    <DriveTitleSkeleton />
    <DriveItemSkeleton />
    <DriveItemSkeleton />
    <DriveItemSkeleton />
    <DriveItemSkeleton />
    <DriveItemSkeleton />
  {/if}
</div>
