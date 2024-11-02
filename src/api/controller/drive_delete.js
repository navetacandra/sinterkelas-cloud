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

    const medias = await conn.query(
      `
      WITH session AS (
        SELECT user_id FROM sessions WHERE token = $1
      ),
      parent AS (
        SELECT 
          *, CONCAT(path, name, '/') AS full_path 
        FROM cloud_items 
        WHERE id = $2
        AND user_id = (SELECT user_id FROM session)
      ), 
      children AS (
        SELECT 
          *, CONCAT(path, name) AS full_path 
        FROM cloud_items 
        WHERE path ~* CONCAT('^', (SELECT full_path FROM parent))
        AND user_id = (SELECT user_id FROM session)
      ),
      items AS (
        SELECT * FROM parent 
          UNION ALL 
        SELECT * FROM children
      )
      SELECT 
        i.id AS item_id, 
        cm.id AS media_id, 
        cm.local_path, 
        i.full_path 
      FROM items i 
      LEFT JOIN cloud_medias cm 
        ON i.id = cm.item_id;
        `,
      [token, id],
    );
    if (medias.rowCount < 1) {
      await conn.query("ROLLBACK");
      return res
        .status(404)
        .json({ status: "error", message: "Item not found" });
    }

    const item_paths = medias.rows
      .map((media) => media.full_path)
      .filter((f) => f);
    const item_id = medias.rows.map((media) => media.item_id).filter((f) => f);
    const item_id_q = item_id.map((_, i) => `$${i + 1}`).join(", ");
    const media_id = medias.rows
      .map((media) => media.media_id)
      .filter((f) => f);
    const media_id_q = media_id.map((_, i) => `$${i + 1}`).join(", ");

    await conn.query(
      `DELETE FROM cloud_items WHERE id IN (${item_id_q});`,
      item_id,
    );
    await conn.query(
      `DELETE FROM cloud_medias WHERE id IN (${media_id_q});`,
      media_id,
    );

    for (const path of item_paths) {
      if (existsSync(path)) {
        unlinkSync(path);
      }
    }

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
