<script>
  import { onMount } from "svelte";
  import { navigate } from "svelte-routing";
  import { request } from "../../utils/request.js";
  import { getDriveInfo } from "../../utils/driveInfo.js";
  import { currentPath, currentItems } from "../../states/driveInfo.js";
  import BottomWidget from "../../components/bottom_widget.svelte";
  import RenameModal from "../../components/modals/rename.svelte";
  import DeleteModal from "../../components/modals/delete.svelte";
  import DrivePath from "../../components/drive/path/index.svelte";
  import DriveItem from "../../components/drive/item/index.svelte";
  import DriveTitleSkeleton from "../../components/drive/path/skeleton.svelte";
  import DriveItemSkeleton from "../../components/drive/item/skeleton.svelte";

  export let id = "";
  let loading = true;
  let error = false;
  let paths = [];
  let items = [];

  currentItems.subscribe((value) => {
    if (!value.current) return;
    const { items: i, path: p, current: c } = value;
    items = i.sort((a, b) => {
      if (a.type === "directory" && b.type !== "directory") return -1;
      if (a.type !== "directory" && b.type === "directory") return 1;

      return a.name < b.name ? -1 : a.name > b.name ? 1 : 0;
    });
    paths = p.sort(
      (a, b) => a.full_path.split("/").length - b.full_path.split("/").length,
    );
    currentPath.set(p.slice(-1)[0]);
  });

  $: {
    getDriveInfo(
      id,
      null,
      () => navigate(`/file/${id}`),
      () => (error = true),
      () => (loading = false),
    );
  }
</script>

<div class="px-4 md:px-32 xl:px-64 py-12 mt-5 text-black dark:text-white">
  {#if !loading}
    {#if error}
      <div class="shadow-neo rounded-lg border-2 border-black p-6">
        <h1 class="text-3xl font-bold mb-2.5 text-center">{error}!</h1>
        <p class="text-center text-lg">
          Back to <a
            href="/drive"
            class="text-blue-700 hover:underline dark:text-dark-primary">home</a
          >
        </p>
      </div>
    {:else}
      <DrivePath {paths} />
      {#each items as item}
        <DriveItem {item} />
      {/each}
      <BottomWidget />
      <RenameModal />
      <DeleteModal />
    {/if}
  {:else}
    <DriveTitleSkeleton />
    <DriveItemSkeleton />
    <DriveItemSkeleton />
    <DriveItemSkeleton />
    <DriveItemSkeleton />
    <DriveItemSkeleton />
  {/if}
</div>
