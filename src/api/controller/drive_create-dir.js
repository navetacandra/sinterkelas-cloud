const { getOrCreateBaseDrive, isValidUUID, getDriveInfo } = require('./drive');

exports.driveCreateDir = async function (req, res) {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const token = req.headers['x-access-token'] || req.cookies['token'];

  try {
    // Retrieve or initialize base directory
    const baseDrive = await getOrCreateBaseDrive(conn, token);

    // Extract driveId and name from request body
    const { driveId, name } = req.body;
    const itemId = driveId ?? baseDrive.rows[0].id;

    if (!name) {
      return res.status(400).json({ status: 'error', message: 'Name is required' });
    }
    if(!name.match(/^[^\\\/\?\*\&quot;\'\&gt;\&lt;\:\|]*$/)) {
      return res.status(400).json({ status: 'error', message: 'Invalid name' });
    }
    if (!isValidUUID(itemId)) {
      return res.status(400).json({ status: 'error', message: 'Invalid drive' });
    }

    // Get current drive info
    const current = await getDriveInfo(conn, itemId, token);
    if (current.rowCount < 1) {
      return res.status(404).json({ status: 'error', message: 'Drive not found' });
    }

    // Check if directory name already exists at the specified path
    const sameName = await conn.query(
      `SELECT * FROM cloud_items 
      WHERE name=$1 AND path=$2 AND user_id=(SELECT user_id FROM sessions WHERE token=$3);`,
      [name, current.rows[0].path, token]
    );

    if (sameName.rowCount > 0) {
      return res.status(400).json({ status: 'error', message: 'Name already exists' });
    }

    // Insert new directory
    const data = await conn.query(
      `INSERT INTO cloud_items (user_id, name, path, type) 
      VALUES ((SELECT user_id FROM sessions WHERE token=$1), $2, $3, 'directory') 
      RETURNING *;`,
      [token, name, current.rows[0].path]
    );

    return res.status(200).json({ status: 'success', data: data.rows[0] });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
};
