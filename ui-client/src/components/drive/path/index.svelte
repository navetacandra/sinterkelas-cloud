<script>
  import { Link, navigate } from "svelte-routing";
  export let paths;

  let pathFront = [];
  let pathMid = [];
  let pathBack = [];

  $: {
    pathFront = [];
    pathMid = [];
    pathBack = [];

    if (paths.length > 4) {
      pathFront = paths.slice(0, 1);
      pathMid = paths.slice(1, paths.length - 1).reverse();
      pathBack = paths.slice(-1);
    } else {
      pathFront = paths;
    }
  }

  function handleMenuClick(path) {
    navigate(`/drive/${path.id}`);
  }

  function toggleDropdown(status) {
    const menu = document.getElementById("dropdown-pathMid");
    if (status === true) menu.classList.remove("hidden");
    else if (status === false) return menu.classList.add("hidden");
    else menu.classList.toggle("hidden");
    menu.focus();
  }

  function handleBlur(e) {
    if (e.relatedTarget) return;
    toggleDropdown(false);
  }

  function chevronRight() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-chevron-right" viewBox="0 0 16 16">
      <path fill-rule="evenodd" d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708"/>
    </svg>`;
  }
</script>

<div class="text-xl flex mb-8">
  {#each pathFront as path, i}
    <p class="text-black dark:text-white flex items-center">
      {#if i !== pathFront.length - 1}
        <Link
          class="mx-1 cursor-pointer text-blue-800 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 hover:underline line-clamp-1 text-ellipsis overflow-hidden"
          to={!!path.name ? `/drive/${path.id}` : "/drive"}
          >{path.name || "Home"}
        </Link>
      {:else if pathBack.length < 1}
        <span
          class="mx-1 cursor-default text-black font-semibold line-clamp-1 text-ellipsis overflow-hidden"
          >{path.name || "Home"}</span
        >
      {:else}
        <Link
          class="mx-1 cursor-pointer text-blue-800 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 hover:underline line-clamp-1 text-ellipsis overflow-hidden"
          to={!!path.name ? `/drive/${path.id}` : "/drive"}
          >{path.name || "Home"}
        </Link>
      {/if}
      {#if i !== pathFront.length - 1}
        {@html chevronRight()}
      {/if}
    </p>
  {/each}

  {#if pathMid.length > 0}
    <div class="relative inline-block text-left ml-2">
      <div class="flex items-center">
        {@html chevronRight()}
        <button
          on:click={() => toggleDropdown()}
          class="inline-flex justify-center gap-x-1.5 px-3 py-2 text-sm font-semibold text-black"
          aria-haspopup="true"
        >
          <span>...</span>
        </button>
      </div>

      <div
        id="dropdown-pathMid"
        class="absolute hidden overflow-hidden mt-2 w-48 origin-top-right border-2 border-black shadow-neo-sm rounded-md bg-white z-10 animate-scale-in"
        aria-orientation="vertical"
        on:blur={handleBlur}
        tabindex="-1"
      >
        {#each pathMid as path}
          <button
            class="block w-full text-left px-4 py-2 text-sm cursor-pointer text-black hover:bg-gray-200 border-b-2 last:border-none border-black"
            on:click={() => handleMenuClick(path)}
          >
            <span class="line-clamp-1 text-ellipsis">
              {path.name}
            </span>
          </button>
        {/each}
      </div>
    </div>
  {/if}

  {#each pathBack as path, i}
    <p class="text-black dark:text-white flex items-center">
      {@html chevronRight()}
      {#if i < pathBack.length - 1}
        <Link
          class="mx-1 cursor-pointer text-blue-800 hover:text-blue-600 dark:text-blue-500 dark:hover:text-blue-400 hover:underline line-clamp-1 text-ellipsis overflow-hidden"
          to={!!path.name ? `/drive/${path.id}` : "/drive"}
          >{path.name || "Home"}</Link
        >
      {:else}
        <span
          class="mx-1 cursor-default text-black font-semibold line-clamp-1 text-ellipsis overflow-hidden"
          >{path.name || "Home"}</span
        >
      {/if}
    </p>
  {/each}
</div>
