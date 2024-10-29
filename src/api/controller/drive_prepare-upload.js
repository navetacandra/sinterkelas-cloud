const path = require("path");

/**
 * Generates a unique file name by incrementing a counter if the name already exists.
 * @param {import('pg').Client} conn - PostgreSQL connection instance.
 * @param {Object} params - The parameters.
 * @param {string} params.owner - The ID of the file owner.
 * @param {string} params._path - The file path.
 * @param {string} params.fname - The original file name.
 * @param {string} [params.type='file'] - The type of item (default is 'file').
 * @returns {Promise<string>} - A promise that resolves with the incremented unique name.
 */
exports.getIncrementName = async (
  conn,
  { owner, _path, fname, type = "file" },
) => {
  const ext = path.extname(fname);
  const basename = path.basename(fname, ext);

  try {
    const namesQuery = await conn.query(
      `SELECT name FROM cloud_items 
       WHERE user_id=$1 AND path=$2 AND type=$3 AND name ~* $4;`,
      [owner, _path, type, `^${basename}(?: \\(\\d+\\))?${ext}$`],
    );

    if (namesQuery.rowCount === 0) return fname;

    let incrementedName = fname;
    let counter = 1;

    while (namesQuery.rows.some((row) => row.name === incrementedName)) {
      incrementedName = `${basename} (${counter++})${ext}`;
    }

    return incrementedName;
  } catch (error) {
    throw error;
  }
};

/**
 * Prepares files for upload by resolving their unique names.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
exports.drive_prepare_upload = async (req, res) => {
  const conn = req.pgConn;
  const { files, path: _path } = req.body;
  const token = req.headers["x-access-token"] || req.cookies["token"];

  if (!files || files.length === 0) {
    return res
      .status(400)
      .json({ status: "error", message: "No files were uploaded." });
  }

  try {
    const currentPathQuery = await conn.query(
      `SELECT id, user_id, CONCAT(path, name, '/') AS path 
       FROM cloud_items 
       WHERE CONCAT(path, name, '/') = $1
       AND type = 'directory'
       AND user_id = (
         SELECT user_id 
         FROM sessions 
         WHERE token = $2
       );`,
      [_path, token],
    );

    if (currentPathQuery.rowCount === 0) {
      return res.status(400).json({ status: "error", message: "Invalid path" });
    }

    const current = currentPathQuery.rows[0];
    const resolvedFiles = await Promise.all(
      files.map(async (file) => ({
        original: file,
        resolved: await this.getIncrementName(conn, {
          owner: current.user_id,
          _path: current.path.endsWith("/") ? current.path : current.path + "/",
          fname: file,
        }),
      })),
    );

    return res.status(200).json({ status: "success", files: resolvedFiles });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "File upload failed.", error });
  }
};
