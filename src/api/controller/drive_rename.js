exports.drive_rename = async function (req, res) {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const { id, name } = req.body;
  const token = req.headers["x-access-token"] || req.cookies["token"];

  if (!id) {
    return res.status(400).json({ status: "error", message: "id is required" });
  }

  if (!name) {
    return res
      .status(400)
      .json({ status: "error", message: "Name is required" });
  }
  if (!name.match(/^[^\\\/\?\*\"\'\>\<\:\|]*$/)) {
    return res.status(400).json({ status: "error", message: "Invalid name" });
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

    const duplicated = await conn.query(
      `SELECT * FROM cloud_items WHERE name = $1 AND user_id = (SELECT user_id FROM sessions WHERE token = $2) AND path = (SELECT path FROM cloud_items WHERE id = $3) AND id != $3;`,
      [name, token, id],
    );

    if (duplicated.rowCount > 0) {
      await conn.query("ROLLBACK");
      return res
        .status(409)
        .json({ status: "error", message: "Item already exists" });
    }

    await conn.query(
      `WITH old AS (
     SELECT * FROM cloud_items WHERE id=$1
   ), 
   updated AS (
     UPDATE cloud_items 
     SET name=$2 
     WHERE id=$1 
     RETURNING *
   ) 
   UPDATE cloud_items 
   SET path = regexp_replace(
     path, 
     CONCAT('^', (SELECT path || name || '/' FROM old)), 
     (SELECT path || name || '/' FROM updated)
   ) 
   WHERE path LIKE (SELECT path || name || '/%' FROM old) 
   RETURNING id;`,
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
