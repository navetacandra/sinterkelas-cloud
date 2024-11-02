<script>
  import Modal from "../../templates/modal.svelte";
  import { request } from "../../utils/request.js";
  import { getDriveInfo } from "../../utils/driveInfo.js";
  import { currentPath, uploadState } from "../../states/driveInfo.js";

  export let show;
  export let close = () => {};

  let driveId = "";
  let path = "";
  let fileInput;
  let loading = false;
  let error = "";
  let files = [];

  // Subscribe to current path changes
  currentPath.subscribe(({ id, full_path }) => {
    driveId = id;
    path = full_path;
  });

  const dragHandler = (e) => e.preventDefault();

  function dropHandler(e) {
    e.preventDefault();
    if (e.dataTransfer.files) {
      updateFileInput(e.dataTransfer.files);
    }
  }

  function updateFileInput(droppedFiles) {
    const dataTransfer = new DataTransfer();
    [...fileInput.files, ...droppedFiles].forEach((file) =>
      dataTransfer.items.add(file),
    );
    fileInput.files = dataTransfer.files;
    fileInput.dispatchEvent(new Event("change", { bubbles: true }));
  }

  async function prepareUpload(e) {
    e.preventDefault();
    resetErrorAndLoading();

    try {
      const fileNames = Array.from(fileInput.files).map((f) => f.name);
      const json = await fetchUploadMetadata(fileNames);
      files = buildFileList(json.files);
      close();
      uploadFiles();
    } catch (err) {
      handleError(err);
    } finally {
      loading = false;
    }
  }

  function resetErrorAndLoading() {
    error = "";
    loading = true;
  }

  async function fetchUploadMetadata(fileNames) {
    const result = await request(`/api/drive/prepare-upload`, {
      headers: { "Content-Type": "application/json" },
      method: "POST",
      body: JSON.stringify({ files: fileNames, path }),
    });
    return await result.json();
  }

  function buildFileList(metadataFiles) {
    return Array.from(fileInput.files).map((file) => ({
      file,
      name: metadataFiles.find((f) => f.original === file.name)?.resolved || "",
    }));
  }

  function handleError(err) {
    console.error(err);
    error = err.message || err.toString();
  }

  function uploadFiles() {
    files.forEach((_file) => initiateUpload(_file));
  }

  function initiateUpload({ file, name }) {
    const id = self.crypto ? self.crypto.randomUUID() : Date.now().toString(16);
    const formData = new FormData();
    const xhr = new XMLHttpRequest();

    addUploadState(id, name);

    formData.append("file", new File([file], name, { type: file.type }));
    xhr.open("POST", `/api/drive/upload?path=${encodeURIComponent(path)}`);

    xhr.upload.addEventListener("progress", (e) => updateProgress(id, e));
    xhr.addEventListener("load", ({ currentTarget: { status } }) =>
      updateStatus(id, status),
    );

    xhr.send(formData);
  }

  function addUploadState(id, name) {
    uploadState.update((state) => [
      ...state.filter((s) => s.status !== "uploaded"),
      { id, name, progress: 0, status: "uploading" },
    ]);
  }

  function updateProgress(id, e) {
    const progress = Math.round((e.loaded * 100) / e.total);
    uploadState.update((state) => {
      const index = state.findIndex(
        (f) => f.id === id && f.status === "uploading",
      );
      if (index !== -1) state[index].progress = progress;
      return state;
    });
  }

  function updateStatus(id, status) {
    uploadState.update((state) => {
      const index = state.findIndex(
        (f) => f.id === id && f.status === "uploading",
      );
      if (index !== -1)
        state[index].status = status === 200 ? "uploaded" : "error";
      if (status === 200) getDriveInfo(driveId);
      return state;
    });
  }
</script>

<Modal {show} title="Upload File" {close}>
  <input
    bind:this={fileInput}
    on:change={prepareUpload}
    type="file"
    id="file-upload"
    class="hidden"
    multiple
  />
  <div
    class="flex flex-col justify-center items-center my-12"
    on:dragover={dragHandler}
    on:drop={dropHandler}
    role="region"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      fill="currentColor"
      class="text-black min-w-20 w-20 min-h-20 h-20 opacity-75"
      viewBox="0 0 16 16"
    >
      <path
        fill-rule="evenodd"
        d="M7.646 5.146a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1-.708.708L8.5 6.707V10.5a.5.5 0 0 1-1 0V6.707L6.354 7.854a.5.5 0 1 1-.708-.708z"
      />
      <path
        d="M4.406 3.342A5.53 5.53 0 0 1 8 2c2.69 0 4.923 2 5.166 4.579C14.758 6.804 16 8.137 16 9.773 16 11.569 14.502 13 12.687 13H3.781C1.708 13 0 11.366 0 9.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383m.653.757c-.757.653-1.153 1.44-1.153 2.056v.448l-.445.049C2.064 6.805 1 7.952 1 9.318 1 10.785 2.23 12 3.781 12h8.906C13.98 12 15 10.988 15 9.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 4.825 10.328 3 8 3a4.53 4.53 0 0 0-2.941 1.1z"
      />
    </svg>
    <h1 class="text-xl font-semibold">Drag & Drop File Here</h1>
    <p class="text-xl my-2">or</p>
    <label
      class="bg-cyan py-1 px-3 rounded cursor-pointer border-2 border-black shadow-neo-sm transition-all duration-200 hover:translate-x-1 hover:shadow-none"
      for="file-upload">Choose file(s)</label
    >
  </div>
</Modal>
