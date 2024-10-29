const { unlinkSync, existsSync } = require("fs");

function removeFile(filepath = "") {
  if (existsSync(filepath)) {
    unlinkSync(filepath);
  }
}

/**
 * Uploads a file to the specified path, ensuring no duplicates and linking it in the database.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.drive_upload = async (req, res) => {
  const { file, query } = req;
  const { path } = query;

  if (!file) {
    return res
      .status(400)
      .json({ status: "error", message: "No files were uploaded." });
  }

  if (!path) {
    removeFile(file.path);
    return res
      .status(400)
      .json({ status: "error", message: "No path was provided." });
  }

  const { originalname, path: filepath } = file;
  const conn = req.pgConn;
  const normalizedPath = path.endsWith("/") ? path : path + "/";
  const token = req.headers["x-access-token"] || req.cookies["token"];

  try {
    // Begin transaction
    await conn.query("BEGIN");

    // Validate the provided path and retrieve current directory information
    const {
      rows: [current],
      rowCount,
    } = await conn.query(
      `SELECT id, user_id, CONCAT(path, name, '/') AS path 
       FROM cloud_items 
       WHERE CONCAT(path, name, '/') = $1 
         AND type = 'directory' 
         AND user_id = (SELECT user_id FROM sessions WHERE token = $2);`,
      [normalizedPath, token],
    );

    if (rowCount === 0) {
      removeFile(filepath);
      await conn.query("ROLLBACK");
      return res.status(400).json({ status: "error", message: "Invalid path" });
    }

    // Check for duplicates
    const duplicateCheck = await conn.query(
      `SELECT id FROM cloud_items 
       WHERE user_id = $1 AND path = $2 AND name = $3;`,
      [current.user_id, current.path, originalname],
    );

    if (duplicateCheck.rowCount > 0) {
      removeFile(filepath);
      await conn.query("ROLLBACK");
      return res
        .status(400)
        .json({ status: "error", message: "File already exists." });
    }

    // Insert the new file into cloud_items
    const insertResult = await conn.query(
      `INSERT INTO cloud_items (user_id, name, path, type) 
       VALUES ($1, $2, $3, 'file') RETURNING id;`,
      [current.user_id, originalname, current.path],
    );

    if (insertResult.rowCount === 0) {
      removeFile(filepath);
      await conn.query("ROLLBACK");
      return res
        .status(500)
        .json({ status: "error", message: "File upload failed." });
    }

    // Link the file path in cloud_medias
    await conn.query(
      `INSERT INTO cloud_medias (local_path, item_id) 
       VALUES ($1, $2);`,
      [filepath, insertResult.rows[0].id],
    );

    // Commit transaction
    await conn.query("COMMIT");

    return res.json({
      status: "success",
      message: "File uploaded successfully.",
    });
  } catch (error) {
    removeFile(filepath);
    await conn.query("ROLLBACK");
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "File upload failed.", error });
  }
};
