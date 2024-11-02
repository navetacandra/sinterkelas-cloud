const { unlinkSync, existsSync } = require("fs");

exports.drive_delete = async function (req, res) {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const { id } = req.body;
  const token = req.headers["x-access-token"] || req.cookies["token"];

  if (!id) {
    return res.status(400).json({ status: "error", message: "id is required" });
  }

  try {
    await conn.query("BEGIN");
    const item = await conn.query(
      `SELECT * FROM cloud_items WHERE id = $1 AND user_id = (SELECT user_id FROM sessions WHERE token = $2);`,
      [id, token],
    );

    if (item.rowCount === 0) {
      await conn.query("ROLLBACK");
      return res
        .status(404)
        .json({ status: "error", message: "Item not found" });
    }

    const media = await conn.query(
      `
      SELECT cm.*, ci.id FROM cloud_items ci JOIN cloud_medias cm ON cm.item_id=ci.id WHERE ci.id=$1 AND ci.user_id = (SELECT user_id FROM sessions WHERE token = $2);
    `,
      [id, token],
    );
    if (media.rowCount < 1) {
      await conn.query("ROLLBACK");
      return res
        .status(404)
        .json({ status: "error", message: "Item not found" });
    }

    await conn.query(
      `
      DELETE FROM cloud_items WHERE id=$1 AND user_id = (SELECT user_id FROM sessions WHERE token = $2);
    `,
      [id, token],
    );

    await conn.query(
      `
      DELETE FROM cloud_medias WHERE item_id=$1;
    `,
      [id],
    );

    if (existsSync(media.rows[0].local_path))
      unlinkSync(media.rows[0].local_path);

    await conn.query("COMMIT");
    return res.status(200).json({ status: "success", message: "Item renamed" });
  } catch (error) {
    await conn.query("ROLLBACK");
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};
