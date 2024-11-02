<script>
  import { request } from "../../utils/request";
  import Skeleton from "./skeleton.svelte";

  export let id = "";
  let loading = true;
  let error = "";
  let is_public = false;
  let info = {};

  async function getFileInfo() {
    try {
      const response = await request(`/api/drive/file-info`, {
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
        body: JSON.stringify({ id }),
      });
      const json = await response.json();
      info = json.data;
    } catch (err) {
      console.error(err);
      error = err.message || err.toString();
    } finally {
      loading = false;
    }
  }

  function download() {
    if (error.length > 0) return;
    const link = document.createElement("a");
    link.href = `/download/${id}`;
    link.setAttribute("download", info.name);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function calculateSize(sizeInByte) {
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    if (sizeInByte == 0) return "n/a";
    const i = Math.floor(Math.log(sizeInByte) / Math.log(1024));
    return (sizeInByte / Math.pow(1024, i)).toFixed(2) + " " + sizes[i];
  }

  $: {
    getFileInfo();
  }
</script>

{#if loading}
  <Skeleton />
{:else if error.length > 0}
  <div class="px-4 md:px-32 xl:px-64 flex justify-center py-12 mt-5 text-black">
    {#if error === "Access denied"}
      <div
        class="shadow-neo rounded-lg border-2 border-black p-6 w-full md:w-1/2"
      >
        <h1 class="text-3xl font-bold mb-2.5 text-center">Item is private!</h1>
        <p class="text-center text-lg">
          Back to <a
            href="/drive"
            class="text-blue-700 hover:underline dark:text-dark-primary">home</a
          >
        </p>
      </div>
    {:else}
      <div
        class="shadow-neo rounded-lg border-2 border-black p-6 w-full md:w-1/2"
      >
        <h1 class="text-3xl font-bold mb-2.5 text-center">{error}!</h1>
        <p class="text-center text-lg">
          Back to <a
            href="/drive"
            class="text-blue-700 hover:underline dark:text-dark-primary">home</a
          >
        </p>
      </div>
    {/if}
  </div>
{:else}
  <div class="mt-8 px-8 w-full">
    <div
      class="flex flex-col bg-gray-100 border-2 border-black rounded w-full md:w-1/2 px-4 min-h-48 shadow-neo"
    >
      <p class="w-full h-6 mb-5 mt-4 text-lg">{info.name}</p>
      <div class="mb-4 w-full">
        <p class="w-full"><b>Size</b>: {calculateSize(info.size)}</p>
        <p class="w-full"><b>Type</b>: {info.type}</p>
        <p class="w-full"><b>Uploaded at</b>: {info.uploaded_at}</p>
      </div>
      <button
        class="w-max self-end h-8 block bg-cyan border-2 px-3 border-black rounded transition-all duration-200 shadow-neo-sm hover:shadow-none hover:translate-x-1 mb-4 me-4"
        on:click={download}
      >
        Download
      </button>
    </div>
  </div>
{/if}
