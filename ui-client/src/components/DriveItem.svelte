<script>
  import { Link } from "svelte-routing";
  export let item;
  function preventSingleClick(e) {
    if (
      !/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent,
      )
    ) {
      e.preventDefault();
    }
  }
  function openDoubleClick(e) {
    window.location.href = e.__root.getAttribute("href");
  }
</script>

<Link
  on:click={preventSingleClick}
  on:dblclick={openDoubleClick}
  to={`/drive/${item.id}`}
  class="w-full cursor-pointer py-3 bg-black rounded bg-gray-300 dark:bg-gray-700 mb-2.5 px-4 block"
>
  <div class="flex text-black dark:text-white">
    {#if item.type == "directory"}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="w-7 h-7 mr-3 text-dark-primary"
        viewBox="0 0 16 16"
      >
        <path
          d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"
        />
      </svg>
    {/if}
    {#if item.type == "file"}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="currentColor"
        class="w-7 h-7 mr-3 text-dark-primary"
        viewBox="0 0 16 16"
      >
        <path
          d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"
        />
      </svg>
    {/if}
    <span class="text-lg">{item.name}</span>
  </div>
</Link>
