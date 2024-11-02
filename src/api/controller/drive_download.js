const { statSync, existsSync, createReadStream } = require("fs");
const { createGunzip } = require("zlib");

function sendGunziped(res, path) {
  const stream = createReadStream(path);
  const gunzip = createGunzip();
  stream.pipe(gunzip).pipe(res);
}

exports.drive_download = async function (req, res) {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const { id } = req.params;
  const token = req.headers["x-access-token"] || req.cookies["token"];

  if (!id) {
    return res.status(400).json({ status: "error", message: "id is required" });
  }

  try {
    const item = await conn.query(
      `SELECT * FROM cloud_items WHERE id = $1 AND type = 'file';`,
      [id],
    );

    if (item.rowCount === 0) {
      return res
        .status(404)
        .json({ status: "error", message: "Item not found" });
    }

    const media = await conn.query(
      `
      SELECT cm.*, ci.id, ci.name, ci.public FROM cloud_items ci JOIN cloud_medias cm ON cm.item_id=ci.id WHERE ci.id=$1;
    `,
      [id],
    );
    if (media.rowCount < 1) {
      return res
        .status(404)
        .json({ status: "error", message: "Item not found" });
    }

    const { local_path, public, name } = media.rows[0];
    if (!existsSync(local_path)) {
      return res
        .status(404)
        .json({ status: "error", message: "Item not found" });
    }

    if (!public) {
      const session = await conn.query(
        `SELECT id FROM cloud_items WHERE id = $1 AND user_id = (SELECT user_id FROM sessions WHERE token = $2);`,
        [id, token],
      );

      if (session.rowCount === 0) {
        return res
          .status(403)
          .json({ status: "error", message: "Access denied" });
      }
    }

    const { fileTypeFromFile } = await import("file-type");
    const stats = statSync(local_path);

    const acceptGzip = (req.headers["accept-encoding"] || "").includes("gzip");
    if (acceptGzip) {
      const type = await fileTypeFromFile(local_path);
      res.setHeader("Content-Type", type.mime || "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${name}"`);
      res.setHeader("Content-Length", stats.size);

      return res.sendFile(local_path);
    } else {
      res.setHeader("Content-Type", "application/octet-stream");
      res.setHeader("Content-Disposition", `attachment; filename="${name}"`);

      sendGunziped(res, local_path);
    }
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};
