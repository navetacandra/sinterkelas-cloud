
exports.drive = async function (req, res) {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const token = req.headers['x-access-token'] || req.cookies['token'];

  try {
    // Retrieve or initialize base directory
    const baseDrive = await exports.getOrCreateBaseDrive(conn, token);

    // Get the drive ID, defaulting to base drive ID if not provided
    const itemId = req.params.driveId ?? baseDrive.rows[0].id;

    // Validate the itemId format
    if (!exports.isValidUUID(itemId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid drive' });
    }

    // Get current drive info
    const current = await exports.getDriveInfo(conn, itemId, token);
    if (current.rowCount < 1) {
      return res.status(404).json({ status: 'error', message: 'Drive not found' });
    }

    // Fetch drive items
    const driveItems = await exports.getDriveItems(conn, current.rows[0].path, token);

    return res.status(200).json({ status: 'success', data: driveItems.rows });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};

// Helper functions

exports.getOrCreateBaseDrive = async function(conn, token) {
  let baseDrive = await conn.query(
    `SELECT * FROM cloud_items 
    WHERE user_id=(SELECT user_id FROM sessions WHERE token=$1)
    AND name='' AND path='' AND type='directory';`,
    [token]
  );

  if (baseDrive.rowCount < 1) {
    baseDrive = await conn.query(
      `INSERT INTO cloud_items (user_id, name, path, type) 
      VALUES ((SELECT user_id FROM sessions WHERE token=$1), '', '', 'directory') 
      RETURNING *;`,
      [token]
    );
  }
  return baseDrive;
}

exports.isValidUUID = function(itemId) {
  return /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(itemId);
}

exports.getDriveInfo = async function(conn, itemId, token) {
  return await conn.query(
    `SELECT id, CONCAT(path, name, '/') AS path, type, public 
    FROM cloud_items 
    WHERE id=$1 AND user_id=(SELECT user_id FROM sessions WHERE token=$2);`,
    [itemId, token]
  );
}

exports.getDriveItems = async function(conn, path, token) {
  return await conn.query(
    `SELECT id, name, type, public 
    FROM cloud_items 
    WHERE path=$1 AND user_id=(SELECT user_id FROM sessions WHERE token=$2);`,
    [path, token]
  );
}
