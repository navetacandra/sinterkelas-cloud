<script>
  import Modal from "../../templates/modal.svelte";
  import { request } from "../../utils/request.js";
  import { addToast } from "../../utils/toast.js";
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
  let nameInput;
  let loading = false;
  let error = "";

  currentSelectedMenu.subscribe((s) => (show = s === "rename"));
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
    currentSelectedMenu.set("");
  }

  async function renameItem(e) {
    e.preventDefault();
    error = "";
    loading = true;

    try {
      const result = await request(`/api/drive/rename`, {
        headers: { "Content-Type": "application/json" },
        method: "POST",
        body: JSON.stringify({ id, name }),
      });
      closeModal();
      addToast(`<b>${name}</b> renamed successfully!`, 2000, "green");
      currentSelectedItem.set({});
      name = "";
      getDriveInfo(path);
    } catch (err) {
      console.error(err);
      error = err.message || err.toString();
    } finally {
      loading = false;
    }
  }

  $: {
    if (show && nameInput) {
      nameInput.focus();
    }
  }
</script>

<Modal {show} title="Rename" close={closeModal}>
  <form action="#" method="POST" on:submit={renameItem}>
    <div class="mb-4">
      <label for="name" class="block mb-2">Name</label>
      <input
        bind:value={name}
        bind:this={nameInput}
        type="text"
        id="name"
        class="w-full p-2 border border-gray-300 rounded"
      />
      <small class="text-red-500">{error}</small>
    </div>

    <div class="flex justify-end">
      <button
        type="submit"
        class={"block py-1 px-2 rounded-lg border-2 border-black transition-all duration-200 bg-cyan" +
          (loading
            ? ""
            : " shadow-neo-sm cursor-pointer hover:shadow-none hover:translate-x-1")}
        aria-label="Rename"
      >
        {loading ? "Renaming..." : "Rename"}
      </button>
    </div>
  </form>
</Modal>
