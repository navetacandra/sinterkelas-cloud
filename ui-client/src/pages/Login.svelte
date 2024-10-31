<script>
  import { navigate } from "svelte-routing";
  import { login } from "../utils/user.js";
  let loading = false,
    username = "",
    password = "",
    error = "";

  async function handleSubmit(e) {
    e.preventDefault();
    if (loading) return;
    loading = true;
    error = "";

    try {
      const token = await login({ username, password });
      await window.db.addData("user", { key: "token", value: token });
      navigate("/dashboard");
    } catch (err) {
      error = err.message ?? err.toString();
    } finally {
      loading = false;
    }
  }
</script>

<section>
  <div
    class="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-[100dvh] md:h-screen lg:py-0"
  >
    <div
      class="w-full bg-white rounded-lg shadow-neo border-2 border-black sm:max-w-md xl:p-0"
    >
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1
          class="text-xl text-center font-bold leading-tight tracking-wide text-dark-background md:text-2xl dark:text-light-background"
        >
          LOGIN
        </h1>
        <form
          class="space-y-4 md:space-y-6"
          action="/login"
          on:submit={handleSubmit}
        >
          <div>
            <label
              for="username"
              class="block mb-2 text-sm font-medium text-dark-background dark:text-light-background"
              >Your username</label
            >
            <input
              type="text"
              bind:value={username}
              name="username"
              id="username"
              class="border border-black text-black rounded-lg focus:ring-black block w-full p-2.5 bg-inherit"
              placeholder="username"
              required=""
            />
          </div>
          <div>
            <label
              for="password"
              class="block mb-2 text-sm font-medium text-dark-background dark:text-light-background"
              >Password</label
            >
            <input
              type="password"
              bind:value={password}
              name="password"
              id="password"
              placeholder="••••••••"
              class="border border-black text-black rounded-lg focus:ring-black block w-full p-2.5 bg-inherit"
              required=""
            />
          </div>
          {#if error.length > 0}
            <small class="text-red-500">{error}</small>
          {/if}
          <button
            type="submit"
            class={"w-full transition-all duration-100 font-medium rounded-lg text-sm px-5 py-2.5 text-center border-2 border-black text-black bg-cyan" +
              (loading
                ? " cursor-wait translate-x-1 translate-y-1 "
                : " shadow-neo-sm active:bg-orange focus:bg-orange hover:shadow-none hover:translate-x-1 hover:translate-y-1")}
            >{loading ? "Loading..." : "Sign in"}</button
          >
          <p
            class="text-sm font-light text-dark-background dark:text-light-background"
          ></p>
        </form>
      </div>
    </div>
  </div>
</section>
