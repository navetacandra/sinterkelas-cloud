const { Router } = require("express");
const { login } = require("./controller/login");
const { authenticated } = require("./middleware/authenticated");
const { logout } = require("./controller/logout");
const { forceLogout } = require("./controller/force-logout");
const { me } = require("./controller/me");
const { drive } = require("./controller/drive");
const { driveCreateDir } = require("./controller/drive_create-dir");
const multer = require("multer");
const path = require("path");
const { drive_prepare_upload } = require("./controller/drive_prepare-upload");
const { drive_upload } = require("./controller/drive_upload");
const { drive_rename } = require("./controller/drive_rename");
const { drive_delete } = require("./controller/drive_delete");
const { drive_file_info } = require("./controller/drive_file-info");

const multerStorage = multer.diskStorage({
  destination: (_, __, cb) => {
    cb(null, path.resolve(path.join(__dirname, "..", "..", "uploads")));
  },
});
const multerUpload = multer({ storage: multerStorage });

exports.router = Router();

exports.router.get("/health", (_, res) => {
  res.status(200).json({
    status: "success",
    message: "Healthy",
  });
});

exports.router.post("/login", login);
exports.router.post("/logout", logout);
exports.router.post("/force-logout", authenticated, forceLogout);
exports.router.post("/me", authenticated, me);
exports.router.post("/drive", authenticated, drive);
exports.router.post("/drive/create-dir", authenticated, driveCreateDir);
exports.router.post(
  "/drive/prepare-upload",
  authenticated,
  drive_prepare_upload,
);
exports.router.post(
  "/drive/upload",
  authenticated,
  multerUpload.single("file"),
  drive_upload,
);
exports.router.post("/drive/rename", authenticated, drive_rename);
exports.router.post("/drive/delete", authenticated, drive_delete);
exports.router.post("/drive/file-info", drive_file_info);
exports.router.post("/drive/:driveId", authenticated, drive);

exports.router.all("/*", (_, res) => {
  res.status(404).json({
    status: "error",
    message: "endpoint not found",
  });
});
