<script>
  import Modal from "../../templates/modal.svelte";
  import { request } from "../../utils/request.js";
  import { getDriveInfo } from "../../utils/driveInfo.js";
  import {
    currentSelectedItem,
    currentSelectedMenu,
    currentPath,
  } from "../../states/driveInfo.js";
  let show = false;
  let id = "";
  let path = "";
  let name = "";
  let loading = false;
  let error = "";

  currentSelectedMenu.subscribe((s) => (show = s === "delete"));
  currentPath.subscribe((p) => (path = p.id));
  currentSelectedItem.subscribe((item) => {
    name = item.name;
    id = item.id;
  });

  function openModal() {
    show = true;
    error = "";
  }

  function closeModal() {
    show = false;
    error = "";
    currentSelectedItem.set({});
    currentSelectedMenu.set("");
  }

  async function deleteItem(e) {
    e.preventDefault();
    error = "";
    loading = true;

    try {
      const result = await request(`/api/drive/delete`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ id }),
      });
      closeModal();
      name = "";
      getDriveInfo(path);
    } catch (err) {
      console.error(err);
      error = err.message || err.toString();
    } finally {
      loading = false;
    }
  }
</script>

<Modal {show} title="Delete" close={closeModal}>
  <form action="#" method="POST" on:submit={deleteItem}>
    <div class="mb-4">
      <p class="text-lg">
        Did you really want to delete <br />"<b>{name}</b>"?
      </p>
      <small class="text-red-500">{error}</small>
    </div>

    <div class="flex justify-end">
      <button
        type="submit"
        class={"block py-1 px-2 rounded-lg border-2 border-black transition-all duration-200 bg-darker-orange" +
          (loading
            ? ""
            : " shadow-neo-sm cursor-pointer hover:shadow-none hover:translate-x-1")}
        aria-label="Delete"
      >
        {loading ? "Deleting..." : "Delete"}
      </button>
    </div>
  </form>
</Modal>
