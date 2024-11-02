<script>
  export let unregisterToast = () => {};
  export let duration = 3000;
  export let message = "white";
  export let background = "white";
  let show = false;
  let slide = false;

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  async function showToast() {
    show = true;
    await sleep(duration + 350);
    slide = true;
    await sleep(350);
    unregisterToast();
  }

  setTimeout(() => {
    showToast();
  }, 10);
</script>

<div
  class={`w-full p-2 bg-${background} border-2 border-black shadow-neo rounded transition-all duration-300 mb-3` +
    (show
      ? slide
        ? " translate-y-0 translate-x-[110%]"
        : " translate-y-0"
      : " translate-y-[200%]")}
>
  {@html message}
</div>
