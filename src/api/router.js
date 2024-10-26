const { Router } = require("express");

exports.router = Router();

exports.router.get('/health', (_, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Healthy'
  });
});

exports.router.get('/*', (_, res) => {
  res.status(404).json({
    status: 'error',
    message: 'endpoint not found'
  });
});
