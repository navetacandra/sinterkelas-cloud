<script>
  import { onMount } from "svelte";
  import { Router, Route, Link } from "svelte-routing";
  import ProfileWidget from "./components/profile_widget.svelte";
  import Toast from "./components/toast/index.svelte";
  import GuestShield from "./route/guest.svelte";
  import AuthShield from "./route/authenticated.svelte";
  import Render from "./route/render.svelte";
  import HomePage from "./pages/home.svelte";
  import LoginPage from "./pages/login.svelte";
  import LogoutPage from "./pages/logout.svelte";
  import DrivePage from "./pages/drive/index.svelte";
  import FilePage from "./pages/file/index.svelte";

  onMount(() => {
    while (!window.db) {}
  });
</script>

<Router>
  <ProfileWidget />
  <Toast />

  <Route path="/">
    <HomePage />
  </Route>
  <Route path="/login">
    <GuestShield component={LoginPage} />
  </Route>
  <Route path="/logout">
    <LogoutPage />
  </Route>
  <Route path="/drive">
    <AuthShield component={DrivePage} />
  </Route>
  <Route path="/drive/:id" let:params>
    <DrivePage id={params.id} />
  </Route>
  <Route path="/file/:id" let:params>
    <FilePage id={params.id} />
  </Route>
</Router>
