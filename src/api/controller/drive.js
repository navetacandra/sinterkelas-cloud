/** Drive handler function for managing and retrieving drive items */
exports.drive = async function (req, res) {
  /** @type {import('import('pg').Client} */
  const conn = req.pgConn;
  const token = req.headers["x-access-token"] || req.cookies["token"];

  try {
    // Retrieve or initialize the base directory if it doesn’t exist
    const baseDrive = await exports.getOrCreateBaseDrive(conn, token);

    // Use provided drive ID, or default to the base drive ID if not specified
    const itemId = req.params.driveId ?? baseDrive.rows[0].id;

    // Validate the item ID format to ensure it’s a UUID
    if (!exports.isValidUUID(itemId)) {
      return res
        .status(400)
        .json({ status: "error", message: "Invalid drive" });
    }

    // Retrieve current drive info for the specified or base item ID
    const current = await exports.getDriveInfo(conn, itemId, token);
    if (current.rowCount < 1) {
      return res
        .status(404)
        .json({ status: "error", message: "Drive not found" });
    }

    // Build an array of paths from the current drive path to check nested directories
    const paths = exports.buildPaths(current.rows[0].path);

    // Query the database to retrieve each path based on the user token and path array
    const pQuery = await exports.getDrivePathQuery(conn, paths, token);

    // Fetch all items within the current directory for the specified user
    const driveItems = await exports.getDriveItems(
      conn,
      current.rows[0].path,
      token,
    );

    // Return the full path and items in the response
    return res.status(200).json({
      status: "success",
      data: { path: pQuery.rows, items: driveItems.rows },
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error" });
  }
};

// Helper functions

/**
 * Retrieves or creates the base directory for the user.
 * @param {import('pg').Client} conn - The PostgreSQL client connection.
 * @param {string} token - The user’s session token.
 * @returns {Promise<import('pg').QueryResult>} - The base drive directory row.
 */
exports.getOrCreateBaseDrive = async function (conn, token) {
  // Query for an existing base directory for the user
  let baseDrive = await conn.query(
    `SELECT * FROM cloud_items 
    WHERE user_id = (SELECT user_id FROM sessions WHERE token = $1)
    AND name = '' AND path = '' AND type = 'directory';`,
    [token],
  );

  // If no base directory exists, create one
  if (baseDrive.rowCount < 1) {
    baseDrive = await conn.query(
      `INSERT INTO cloud_items (user_id, name, path, type) 
      VALUES ((SELECT user_id FROM sessions WHERE token = $1), '', '', 'directory') 
      RETURNING *;`,
      [token],
    );
  }

  return baseDrive;
};

/**
 * Validates if a given item ID is in a UUID format.
 * @param {string} itemId - The item ID to validate.
 * @returns {boolean} - True if item ID is a valid UUID, otherwise false.
 */
exports.isValidUUID = function (itemId) {
  return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(itemId);
};

/**
 * Retrieves information about a specific drive item for the current user.
 * @param {import('pg').Client} conn - The PostgreSQL client connection.
 * @param {string} itemId - The drive item ID.
 * @param {string} token - The user’s session token.
 * @returns {Promise<import('pg').QueryResult>} - Drive information row.
 */
exports.getDriveInfo = async function (conn, itemId, token) {
  return await conn.query(
    `SELECT id, CONCAT(path, name, '/') AS path, type, public 
    FROM cloud_items 
    WHERE id = $1 AND user_id = (SELECT user_id FROM sessions WHERE token = $2);`,
    [itemId, token],
  );
};

/**
 * Builds an array of paths from a given path string for checking nested directories.
 * @param {string} path - The current directory path string.
 * @returns {Array<Object>} - Array of objects containing 'name' and 'path' for each level.
 */
exports.buildPaths = function (path) {
  return path
    .slice(0, -1) // Remove the trailing slash
    .split("/")
    .map((_, i, a) => a.slice(0, i + 1)) // Create each level from the root to the current level
    .map((x) => {
      const sliced = x.slice(0, -1);
      return {
        name: x.slice(-1)[0], // Last element as name
        path:
          sliced.length < 1
            ? ""
            : sliced.reduce((a, c) => a + c + (c ? "/" : ""), "/"), // Construct path without extra slashes
      };
    });
};

/**
 * Executes a database query to retrieve each directory path based on the provided paths.
 * @param {import('pg').Client} conn - The PostgreSQL client connection.
 * @param {Array<Object>} paths - Array of path objects to filter on.
 * @param {string} token - The user’s session token.
 * @returns {Promise<import('pg').QueryResult>} - Resulting rows of paths that match the user’s directories.
 */
exports.getDrivePathQuery = async function (conn, paths, token) {
  const filter = paths
    .map((_, i) => `($${i * 2 + 2}, $${i * 2 + 3})`)
    .join(", ");
  const queryValues = [
    token,
    ...paths
      .map((x) => [
        x.name,
        x.path.length > 1 ? x.path + (x.path.endsWith("/") ? "" : "/") : x.path,
      ])
      .flat(),
  ];

  return await conn.query(
    `SELECT ci.id, ci.name, ci.path, CONCAT(ci.path, ci.name, '/') AS full_path
    FROM cloud_items ci
    JOIN sessions s ON s.user_id = ci.user_id
    WHERE s.token = $1 AND (ci.name, ci.path) IN (${filter});`,
    queryValues,
  );
};

/**
 * Retrieves all items within a given directory path for the specified user.
 * @param {import('pg').Client} conn - The PostgreSQL client connection.
 * @param {string} path - Directory path to fetch items from.
 * @param {string} token - The user’s session token.
 * @returns {Promise<import('pg').QueryResult>} - Rows of items within the specified directory.
 */
exports.getDriveItems = async function (conn, path, token) {
  return await conn.query(
    `SELECT id, name, type, public 
    FROM cloud_items 
    WHERE path = $1 AND user_id = (SELECT user_id FROM sessions WHERE token = $2);`,
    [path, token],
  );
};
