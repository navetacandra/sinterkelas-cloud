const { Router } = require("express");
const { login } = require("./controller/login");
const { authenticated } = require("./middleware/authenticated");
const { logout } = require("./controller/logout");
const { forceLogout } = require("./controller/force-logout");
const { me } = require("./controller/me");
const { drive } = require("./controller/drive");
const { driveCreateDir } = require("./controller/drive_create-dir");

exports.router = Router();

exports.router.get('/health', (_, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Healthy'
  });
});

exports.router.post('/login', login);
exports.router.post('/logout', logout);
exports.router.post('/force-logout', authenticated, forceLogout);
exports.router.post('/me', authenticated, me);
exports.router.post('/drive', authenticated, drive);
exports.router.post('/drive/create-dir', authenticated, driveCreateDir);
exports.router.post('/drive/:driveId', authenticated, drive);

exports.router.all('/*', (_, res) => {
  res.status(404).json({
    status: 'error',
    message: 'endpoint not found'
  });
});
