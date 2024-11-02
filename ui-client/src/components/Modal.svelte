<script>
  export let show = false;
  export let title = "";
  export let close = () => {};
</script>

<div
  class="z-[999] fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 transition-opacity px-4"
  role="dialog"
  class:hidden={!show}
  on:keydown={() => {}}
  on:click|self={close}
>
  {#if show}
    <div
      class="bg-white rounded-lg shadow-neo border-2 border-black max-w-lg w-full p-6 transform transition-all duration-300 ease-out animate-scale-in"
      role="dialog"
      on:keydown={() => {}}
      on:click|stopPropagation
    >
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-xl font-semibold">{title}</h3>
        <button
          class="text-gray-700 hover:text-black"
          on:click={close}
          aria-label="Close"
        >
          ✕
        </button>
      </div>
      <div>
        <slot />
      </div>
    </div>
  {/if}
</div>
