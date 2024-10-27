<script>
  import { navigate } from "svelte-routing";
  let loading = false;
  let username = '';
  let password = '';
  let error = '';

  async function handleSubmit(e) {
    e.preventDefault();
    error = '';

    if(!navigator.onLine) {
      error = 'Network unreachable!';
      return;
    }

    try {
      const res = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password
        })
      });

      const json = await res.json();
      if(!res.ok) {
        error = json.message;
      } else {
        await window.db.addData('user', {key: 'token', value: json.data.token});
        navigate('/dashboard')
      }
    } catch(err) {
      error = err.message ?? err.toString();
    }
  }
</script>

<section>
  <div class="flex flex-col items-center justify-center px-6 py-8 mx-auto min-h-[100dvh] md:h-screen lg:py-0">
    <div class="w-full bg-white rounded-lg shadow dark:border dark:bg-gray-800 dark:border-gray-700 sm:max-w-md xl:p-0">
      <div class="p-6 space-y-4 md:space-y-6 sm:p-8">
        <h1 class="text-xl font-bold leading-tight tracking-tight text-dark-background md:text-2xl dark:text-light-background">
          Sign in to your account
        </h1>
        <form class="space-y-4 md:space-y-6" action="/login" on:submit={handleSubmit}>
          <div>
            <label for="username" class="block mb-2 text-sm font-medium text-dark-background dark:text-light-background">Your username</label>
            <input type="text" bind:value={username} name="username" id="username" class="bg-light-background border border-light-accent2 text-dark-background rounded-lg focus:ring-light-primary focus:border-light-primary block w-full p-2.5 dark:bg-dark-background dark:border-dark-accent2 dark:placeholder-gray-400 dark:text-light-background dark:focus:ring-dark-primary dark:focus:border-dark-primary" placeholder="username" required="">
          </div>
          <div>
            <label for="password" class="block mb-2 text-sm font-medium text-dark-background dark:text-light-background">Password</label>
            <input type="password" bind:value={password} name="password" id="password" placeholder="••••••••" class="bg-light-background border border-light-accent2 text-dark-background rounded-lg focus:ring-light-primary focus:border-light-primary block w-full p-2.5 dark:bg-dark-background dark:border-dark-accent2 dark:placeholder-gray-400 dark:text-light-background dark:focus:ring-dark-primary dark:focus:border-dark-primary" required="">
          </div>
          {#if error.length > 0}
          <small class="text-red-500">{error}</small>
          {/if}
          <button type="submit" class="w-full text-light-background bg-light-primary hover:bg-[#6bb9e4] active:bg-[#5aa0cc] focus:ring-4 focus:outline-none focus:ring-light-accent2 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-dark-primary dark:hover:bg-[#187de0] dark:active:bg-[#166ac2] dark:focus:ring-dark-accent2">Sign in</button>
          <p class="text-sm font-light text-dark-background dark:text-light-background">
              <!-- Don’t have an account yet? <a href="#" class="font-medium text-light-primary hover:underline dark:text-dark-primary">Sign up</a> -->
          </p>
        </form>
      </div>
    </div>
  </div>
</section>
