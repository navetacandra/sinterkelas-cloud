const { statSync, existsSync } = require("fs");

exports.drive_file_info = async function (req, res) {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const { id } = req.body;
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
    const type = await fileTypeFromFile(local_path);

    const parseTime = (time) => {
      const date = new Date(time);
      return `${date.getUTCFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()} ${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()}`;
    };

    const data = {
      name,
      uploaded_at: parseTime(stats.ctime),
      size: stats.size,
      type: type.mime || "application/octet-stream",
    };

    return res.status(200).json({ status: "success", data });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};
