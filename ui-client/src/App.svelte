<script>
  import { onMount } from "svelte";
  import { Router, Route, Link } from "svelte-routing";
  import GuestShield from "./route/guest.svelte";
  import AuthShield from "./route/authenticated.svelte";
  import Render from "./route/render.svelte";
  import LoginPage from "./pages/Login.svelte";
  import LogoutPage from "./pages/Logout.svelte";
  import DashboardPage from "./pages/Dashboard.svelte";

  onMount(() => {
    while (!window.db) {}
  });
</script>

<Router>
  <Route path="/">
    <h1 class="text-3xl font-bold">Hello World from Tailwind!</h1>
  </Route>
  <Route path="/login">
    <GuestShield component={LoginPage} />
  </Route>
  <Route path="/logout">
    <LogoutPage />
  </Route>
  <Route path="/dashboard">
    <AuthShield component={DashboardPage} />
  </Route>
  <Route path="/drive">
    <AuthShield component={DashboardPage} />
  </Route>
  <Route path="/drive/:id" let:params>
    <DashboardPage id={params.id} />
  </Route>
</Router>
