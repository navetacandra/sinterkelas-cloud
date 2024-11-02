<script>
  import { navigate } from "svelte-routing";
  import {
    currentSelectedItem,
    currentSelectedMenu,
  } from "../../../states/driveInfo.js";
  export let item;

  function getDropdownElement(id) {
    return document.querySelector(`#dropdown-menu-${id}`);
  }

  function closeAllDropdowns() {
    document.querySelectorAll('[role="menu"]').forEach((el) => {
      el.classList.add("hidden");
      el.style.right = "0px";
      el.style.top = "0px";
    });
  }

  async function toggleDropdown({ element, status, posX, posY }) {
    const dropdown = getDropdownElement(item.id);
    const card = dropdown.closest(".relative");
    const { width, left, top } = card.getBoundingClientRect();
    const positionX = element?.pageX || posX || 0;
    const positionY = element?.pageY || posY || 0;
    const offsetRight = width + left - positionX;
    const offsetTop = positionY - top;

    closeAllDropdowns();
    await new Promise((resolve) => setTimeout(resolve, 10));
    if (status === false) return;

    if (dropdown) {
      dropdown.classList.toggle("hidden", status === false);
      dropdown.style.right = `${Math.max(0, offsetRight)}px`;
      dropdown.style.top = `${offsetTop}px`;

      if (offsetRight >= positionX / 2) {
        const { width: menuWidth } = dropdown.getBoundingClientRect();
        dropdown.style.right = `${offsetRight - menuWidth}px`;
      }
      getDropdownElement(item.id).focus();
    }
  }

  function handleBlur(e) {
    if (e.relatedTarget) return;
    closeAllDropdowns();
  }

  function itemContextMenu(e) {
    e.preventDefault();
    toggleDropdown({ posX: e.pageX, posY: e.pageY });
  }

  function handleMenuClick(action) {
    closeAllDropdowns();
    currentSelectedItem.set(item);
    switch (action) {
      case "open":
        navigate(`/drive/${item.id}`);
        break;
      case "preview":
        console.log(`Handle preview`);
        break;
      case "download":
        console.log(`Handle download`);
        break;
      case "rename":
        currentSelectedMenu.set("rename");
        break;
      case "delete":
        currentSelectedMenu.set("delete");
        break;
      default:
        break;
    }
  }

  $: {
    closeAllDropdowns();
  }
</script>

<div
  class="relative group mb-3.5"
  on:contextmenu={itemContextMenu}
  on:dblclick={() => navigate(`/drive/${item.id}`)}
  role="button"
  tabindex="-1"
>
  <div
    class="w-full cursor-pointer py-3 rounded-lg ps-4 pe-8 block border-2 border-black shadow-neo-sm transition-all group-hover:shadow-none group-hover:translate-x-1 group-hover:translate-y-1 group-hover:bg-gray-200"
    data-item-id={item.id}
  >
    <div class="flex text-black dark:text-white">
      {#if item.type === "directory"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          class="min-w-7 w-7 min-h-7 h-7 mr-3 text-black"
          viewBox="0 0 16 16"
        >
          <path
            d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          fill="currentColor"
          class="min-w-7 w-7 min-h-7 h-7 mr-3 text-black"
        >
          <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path
            d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z"
          />
        </svg>
      {/if}
      <span class="text-lg line-clamp-1">{item.name}</span>
    </div>
  </div>

  <div class="absolute top-0 right-0 my-2.5 w-8 me-3">
    <div class="relative inline-block text-left">
      <button
        on:click={(e) => toggleDropdown({ element: e })}
        class="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-black dark:text-white shadow-sm focus:ring-0 focus:ring-offset-0 transition-all duration-100 group-hover:translate-x-1 group-hover:translate-y-1"
        data-dropdown-toggle={`dropdown-menu-${item.id}`}
        aria-haspopup="true"
        aria-label="Options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          class="text-black min-w-5 w-5 min-h-5 h-5"
          viewBox="0 0 16 16"
        >
          <path
            d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
          />
        </svg>
      </button>

      <div
        id={`dropdown-menu-${item.id}`}
        role="menu"
        on:blur={handleBlur}
        class="absolute hidden right-0 z-10 mt-2 w-32 origin-top-right border-2 border-black shadow-neo-sm rounded-md bg-white animate-scale-in"
        aria-orientation="vertical"
        tabindex="-1"
      >
        <div class="py-1">
          {#if item.type === "directory"}
            <button
              class="block w-full text-left px-4 py-2 text-sm cursor-pointer text-black hover:bg-gray-200 border-b-2 last:border-none border-black"
              on:click={() => handleMenuClick("open")}>Open</button
            >
          {:else}
            <button
              class="block w-full text-left px-4 py-2 text-sm cursor-pointer text-black hover:bg-gray-200 border-b-2 last:border-none border-black"
              on:click={() => handleMenuClick("preview")}>Preview</button
            >
            <button
              class="block w-full text-left px-4 py-2 text-sm cursor-pointer text-black hover:bg-gray-200 border-b-2 last:border-none border-black"
              on:click={() => handleMenuClick("download")}>Download</button
            >
          {/if}
          <button
            class="block w-full text-left px-4 py-2 text-sm cursor-pointer text-black hover:bg-gray-200 border-b-2 last:border-none border-black"
            on:click={() => handleMenuClick("rename")}>Rename</button
          >
          <button
            class="block w-full text-left text-red-500 px-4 py-2 text-sm cursor-pointer text-black hover:bg-gray-200 border-b-2 last:border-none border-black"
            on:click={() => handleMenuClick("delete")}>Delete</button
          >
        </div>
      </div>
    </div>
  </div>
</div>
