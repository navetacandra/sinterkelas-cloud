exports.drive_rename = async function (req, res) {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const { id, name } = req.body;
  const token = req.headers["x-access-token"] || req.cookies["token"];

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

    await conn.query(
      `WITH old AS (
        SELECT * FROM cloud_items WHERE id=$1
      ), 
      updated AS (
        UPDATE cloud_items SET name=$2 WHERE id=$1 RETURNING *
      ) 
      UPDATE cloud_items SET path=REPLACE(
        path, 
        (SELECT CONCAT(path, name, '/') FROM old), 
        (SELECT CONCAT(path, name, '/') FROM updated)
      ) 
      WHERE path LIKE (SELECT CONCAT(path, name, '/%') FROM old) RETURNING id;`,
      [id, name],
    );

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
