<script>
  import { Link } from "svelte-routing";
  import { getCurrentUser } from "../utils/user.js";
  let user = null;
  let open = false;

  async function getUser() {
    user = await getCurrentUser();
  }

  window.db.on("add", ({ storeName, data }) => {
    if (storeName === "user" && data?.key === "data") {
      user = data.value;
    }
  });

  window.db.on("clear", ({ storeName }) => {
    if (storeName === "user") {
      user = null;
    }
  });

  $: {
    getUser();
  }
</script>

<div
  class="fixed top-0 right-0 me-4 mt-4 z-[99] max-w-1/2 md:max-w-1/4 lg:max-w-1/6"
>
  <div class="relative top-0 right-0">
    {#if !user}
      <div
        class="w-full border-2 border-black p-2 rounded shadow-neo-sm transition-all duration-300 animate-slide-bottom-in cursor-pointer bg-green hover:shadow-none hover:translate-y-1"
      >
        <div class="flex items-center">
          <Link
            class="text-black line-clamp-1 text-ellipsis overflow-hidden px-6 font-semibold"
            to="/login"
          >
            Login
          </Link>
        </div>
      </div>
    {:else}
      <div
        class="w-full border-2 border-black p-2 rounded shadow-neo-sm transition-all duration-300 animate-slide-left-in bg-white cursor-pointer hover:shadow-none hover:translate-y-1"
        role="button"
        tabindex="-1"
        on:click={() => {
          if (user) open = !open;
        }}
        on:keydown={() => {}}
      >
        <div class="flex items-center">
          <div
            class="p-2 rounded-full bg-green min-w-8 w-8 min-h-8 h-8 flex items-center justify-center border-2 border-black font-bold me-2"
          >
            {user.name.slice(0, 1)}
          </div>
          <div class="text-black line-clamp-1 text-ellipsis overflow-hidden">
            {user.name}
          </div>
        </div>
      </div>
      <div
        class={"absolute overflow-hidden mt-[.35rem] w-full right-0 origin-top-right border-2 border-black shadow-neo-sm rounded-md bg-white z-10 animate-scale-in" +
          (open ? " block" : " hidden")}
        tabindex="-1"
        role="button"
        on:click={() => (open = false)}
        on:keydown={() => {}}
      >
        <Link
          class="block w-full text-left px-4 py-2 text-sm cursor-pointer text-red-500 hover:bg-gray-200 border-b-2 last:border-none border-black"
          to="/logout"
        >
          Logout
        </Link>
      </div>
    {/if}
  </div>
</div>
