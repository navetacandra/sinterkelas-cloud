<script>
  import { Link } from "svelte-routing";
  export let item;

  function getDropdownElement(id) {
    return document.querySelector(`#dropdown-menu-${id}`);
  }

  function closeAllDropdowns() {
    document.querySelectorAll('[role="menu"]').forEach((el) => {
      el.classList.add("hidden");
      el.style.right = "0px";
    });
  }

  function toggleDropdown({ element, status, posX }) {
    const dropdown = getDropdownElement(item.id);
    const card = dropdown.closest(".relative");
    const { width, left } = card.getBoundingClientRect();
    const positionX = element?.pageX || posX || 0;
    const offsetRight = width + left - positionX;

    closeAllDropdowns();

    if (dropdown) {
      dropdown.classList.toggle("hidden", status === false);
      dropdown.style.right = `${Math.max(0, offsetRight)}px`;

      if (offsetRight >= positionX / 2) {
        const { width: menuWidth } = dropdown.getBoundingClientRect();
        dropdown.style.right = `${offsetRight - menuWidth}px`;
      }
    }
  }

  function itemContextMenu(e) {
    e.preventDefault();
    toggleDropdown({ posX: e.pageX });
    document
      .querySelector(`[data-dropdown-toggle="dropdown-menu-${item.id}"]`)
      .focus();
  }
</script>

<div class="relative">
  <div
    on:contextmenu={itemContextMenu}
    role="button"
    tabindex="-1"
    to={"." || `/drive/${item.id}`}
    class="w-full cursor-pointer py-3 bg-black rounded bg-gray-300 dark:bg-gray-700 mb-2.5 ps-4 pe-8 block"
  >
    <div class="flex text-black dark:text-white">
      {#if item.type === "directory"}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          class="min-w-7 w-7 min-h-7 h-7 mr-3 text-dark-primary"
          viewBox="0 0 16 16"
        >
          <path
            d="M9.828 3h3.982a2 2 0 0 1 1.992 2.181l-.637 7A2 2 0 0 1 13.174 14H2.825a2 2 0 0 1-1.991-1.819l-.637-7a2 2 0 0 1 .342-1.31L.5 3a2 2 0 0 1 2-2h3.672a2 2 0 0 1 1.414.586l.828.828A2 2 0 0 0 9.828 3m-8.322.12q.322-.119.684-.12h5.396l-.707-.707A1 1 0 0 0 6.172 2H2.5a1 1 0 0 0-1 .981z"
          />
        </svg>
      {:else}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          class="min-w-7 w-7 min-h-7 h-7 mr-3 text-dark-primary"
          viewBox="0 0 16 16"
        >
          <path
            d="M4 0h5.293A1 1 0 0 1 10 .293L13.707 4a1 1 0 0 1 .293.707V14a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V2a2 2 0 0 1 2-2m5.5 1.5v2a1 1 0 0 0 1 1h2z"
          />
        </svg>
      {/if}
      <span class="text-lg line-clamp-1">{item.name}</span>
    </div>
  </div>

  <div class="absolute top-0 right-0 my-2.5 w-8 me-2">
    <div class="relative inline-block text-left">
      <button
        on:click={(e) => toggleDropdown({ element: e })}
        on:blur={() => toggleDropdown({ status: false })}
        type="button"
        class="inline-flex w-full justify-center gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-black dark:text-white shadow-sm focus:ring-0 focus:ring-offset-0"
        data-dropdown-toggle={`dropdown-menu-${item.id}`}
        aria-haspopup="true"
        aria-label="Options"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          fill="currentColor"
          class="bi bi-three-dots-vertical"
          viewBox="0 0 16 16"
        >
          <path
            d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
          />
        </svg>
      </button>

      <div
        id={`dropdown-menu-${item.id}`}
        class="absolute hidden right-0 z-10 mt-2 w-32 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none bg-gray-300 dark:bg-gray-700"
        role="menu"
        aria-orientation="vertical"
        tabindex="-1"
      >
        <div class="py-1">
          <span
            class="block px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
            role="menuitem">Open</span
          >
          <span
            class="block px-4 py-2 text-sm cursor-pointer text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white"
            role="menuitem">Rename</span
          >
          <span
            class="block px-4 py-2 text-sm cursor-pointer text-red-500 hover:bg-gray-100 dark:hover:bg-gray-600"
            role="menuitem">Delete</span
          >
        </div>
      </div>
    </div>
  </div>
</div>
