<!-- toast/index.svelte -->
<script>
  import Toast from "./toast.svelte";
  import { toasts, removeToast } from "../../utils/toast.js";
  import { onDestroy } from "svelte";

  // Listen to the store to get active toasts
  let _toasts = new Map();
  const unsubscribe = toasts.subscribe((value) => {
    _toasts = value;
    console.log(value);
  });
</script>

<div
  class="fixed bottom-0 right-0 me-4 mb-4 z-[9999] w-1/2 md:w-1/3 lg:w-1/4 xl:w-1/5"
>
  {#each Array.from(_toasts.entries()) as [id, { message, duration, background }]}
    <Toast
      key={id}
      {message}
      {duration}
      {background}
      unregisterToast={() => removeToast(id)}
    />
  {/each}
</div>
