<script>
  import { uploadState } from "../states/driveInfo.js";
  let open = true;
  let state = [];

  uploadState.subscribe((val) => {
    state = val;
  });

  function progressBar(progress, error = false, done = false) {
    let transform = 100 - progress;
    return `<div class="w-full overflow-hidden border-2 border-black h-3 rounded-full transition-all duration-50">
      <div class="bg-${error ? "darker-pink" : done ? "green" : "cyan"} w-full h-full" style="transform: translateX(${transform * -1}%)"></div>
    </div>`;
  }
</script>

<div class="bg-green hidden"></div>
<div class="bg-darker-pink hidden"></div>
<div
  class={"fixed left-0 bottom-0 w-52 border-2 border-black shadow-neo ms-4 mb-4 rounded transition-all duration-200" +
    (state.length === 0 ? " translate-y-24 opacity-0" : " opacity-1")}
>
  <div
    class="flex items-center justify-between py-2 px-4 bg-purple border-b-2 border-black"
  >
    <h2 class="text-lg">Progress</h2>
    <button on:click={() => (open = !open)} aria-label="Toggle progres">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        fill="currentColor"
        class={"text-black min-w-5 w-5 min-h-5 h-5 transition-all duration-200 " +
          (open ? "rotate-0" : "rotate-180")}
        viewBox="0 0 16 16"
      >
        <path
          fill-rule="evenodd"
          d="M1.646 4.646a.5.5 0 0 1 .708 0L8 10.293l5.646-5.647a.5.5 0 0 1 .708.708l-6 6a.5.5 0 0 1-.708 0l-6-6a.5.5 0 0 1 0-.708"
        />
      </svg>
    </button>
  </div>
  <div
    class={"px-2 overflow-x-hidden bg-white transition-all duration-200 " +
      (open ? "py-2 h-56" : "h-0")}
  >
    {#each state as item}
      <div class="flex items-center justify-between mb-2 w-full">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 384 512"
          fill="currentColor"
          class="min-w-7 w-7 min-h-7 h-7 text-black"
        >
          <!--!Font Awesome Free 6.6.0 by @fontawesome - https://fontawesome.com License - https://fontawesome.com/license/free Copyright 2024 Fonticons, Inc.-->
          <path
            d="M0 64C0 28.7 28.7 0 64 0L224 0l0 128c0 17.7 14.3 32 32 32l128 0 0 288c0 35.3-28.7 64-64 64L64 512c-35.3 0-64-28.7-64-64L0 64zm384 64l-128 0L256 0 384 128z"
          />
        </svg>
        <div class="flex flex-col w-3/4">
          <p class="text-black line-clamp-1 text-ellipsis text-wrap">
            {item.name}
          </p>
          {@html progressBar(
            item.progress,
            item.status == "error",
            item.status == "uploaded",
          )}
        </div>
      </div>
    {/each}
  </div>
</div>
