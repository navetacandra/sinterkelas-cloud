<script>
  import { Link } from "svelte-routing";
  import Vector from "../assets/vector-landing.svelte";

  let texts = ["Akses", "Unggah", "Unduh"];
  let text = texts[0];

  function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  (async function changeText(i = 0) {
    await sleep(2000);
    if (i === texts.length) {
      i = 0;
    }

    const txt = texts[i];
    for (let i = text.length; i >= 0; i--) {
      text = text.slice(0, i);
      await sleep(125);
    }

    for (const t of txt) {
      text += t;
      await sleep(125);
    }

    changeText(++i);
  })(1);
</script>

<section class="bg-white flex items-center justify-center min-h-screen">
  <div
    class="flex flex-col md:flex-row items-center md:space-x-8 lg:space-x-12 xl:space-x-16 text-center md:text-left"
  >
    <div class="flex-shrink-0 mb-6 md:mb-0">
      <Vector />
    </div>

    <div class="space-y-4">
      <h1
        class="text-2xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-light"
      >
        SINTERKELAS <span class="font-bold">Cloud</span>
      </h1>
      <p
        class="text-md md:text-lg lg:text-xl xl:text-2xl 2xl:text-3xl font-semibold"
      >
        <span class="animate-cursor-blink">{text}</span>,
        <span class="font-normal">Di Manapun dan Kapanpun.</span>
      </p>
      <Link
        class="block max-w-max bg-cyan text-black font-semibold px-4 py-1 lg:px-6 lg:py-2 xl:px-8 xl:py-3 rounded border-2 border-black shadow-neo-sm hover:shadow-none hover:translate-x-1 transition"
        to="/login"
      >
        Mulai Sekarang
      </Link>
    </div>
  </div>
</section>

<!-- <div class="grid grid-cols-1 md:grid-cols-2 gap-2 px-2 place-items-center mt-28"> -->
<!--   <div class="w-full flex justify-center md:justify-end items-center md:order-last mb-6"> -->
<!--     <Vector /> -->
<!--   </div> -->
<!--   <div class="w-full flex flex-col justify-center lg:order-first lg:ms-6 2xl:ms-12"> -->
<!--     <h1 class="text-4xl xl:text-5xl xl:text-6xl mb-2">SINTERKELAS <b>Cloud</b></h1> -->
<!--     <h2 class="text-2xl xl:text-4xl text-left mb-5 md:mb-12"><b class="animate-cursor-blink pe-1/2">{text}</b>, Di manapun dan<br class="block lg:hidden"/> Kapanpun!</h2> -->
<!--     <Link to="/drive" class="max-w-max bg-cyan py-1.5 px-3 border-2 border-black shadow-neo-sm rounded transition-all duration-150 hover:shadow-none hover:translate-x-1">Mulai Sekarang</Link> -->
<!--   </div> -->
<!-- </div> -->
