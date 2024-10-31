<script>
  let open = false;

  function openMenu() {
    open = !open;
  }

  function createDirectory() {
    console.log("Create directory");
  }

  function uploadFiles() {
    console.log("Upload files");
  }

  $: {
    open = false;
  }
</script>

<div class="fixed bottom-0 right-0 me-4 mb-4">
  <button
    class={"block cursor-pointer p-1 rounded-lg border-2 border-black shadow-neo-sm transition-all duration-200 bg-white hover:bg-gray-200 hover:shadow-none hover:translate-x-1" +
      (!open
        ? " translate-y-10 opacity-0 scale-.5"
        : " opacity-1 scale-1 -translate-y-8")}
    on:click={createDirectory}
    aria-label="Create Directory"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="text-black min-w-9 w-9 min-h-9 h-9 transition-all duration-100"
      viewBox="0 0 16 16"
    >
      <path
        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"
      />
    </svg>
  </button>

  <button
    class={"block cursor-pointer p-1 rounded-lg border-2 border-black shadow-neo-sm transition-all duration-200 bg-white hover:bg-gray-200 hover:shadow-none hover:translate-x-1" +
      (!open
        ? " translate-y-10 opacity-0 scale-.5"
        : " opacity-1 scale-1 -translate-y-4")}
    on:click={uploadFiles}
    aria-label="Upload File"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="text-black min-w-9 w-9 min-h-9 h-9 transition-all duration-100"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708z"
      />
      <path
        d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"
      />
    </svg>
  </button>

  <button
    class={"z-[999] block relative cursor-pointer p-1 rounded-full border-2 border-black shadow-neo-sm bg-white transition-all duration-200 bg-white hover:bg-gray-200 hover:shadow-none hover:translate-x-1" +
      (open ? "bg-gray-200 shadow-none translate-x-1" : "")}
    on:click={openMenu}
    aria-label="Menu"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class={"text-black min-w-9 w-9 min-h-9 h-9 transition-all duration-100" +
        (open ? " rotate-45" : "")}
      viewBox="0 0 16 16"
    >
      <path
        d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"
      />
    </svg>
  </button>
</div>
