<script>
  import { Router, Route, Link } from "svelte-routing";
  import LoginPage from "./pages/Login.svelte";
</script>

<Router>
  <Route path="/">
    <h1 class="text-3xl font-bold">Hello World from Tailwind!</h1>
  </Route>
  <Route path="/login">
    <LoginPage />
  </Route>
</Router>
