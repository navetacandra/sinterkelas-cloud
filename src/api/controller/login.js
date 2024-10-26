const { compareSync } = require('bcrypt');
const { createHash, randomBytes } = require('crypto');

function generateToken(username = '', ua = '') {
  const hash = createHash('sha256')
  const random = randomBytes(32).toString('hex');
  return hash.update(`${username}${random}${ua}`).digest('hex')
}

exports.login = async (req, res) => {
  /** @type {import('pg').Client} */
  const conn = req.pgConn;
  const { username, password } = req.body; // Get user data
  const ua = req.headers['user-agent']; // Get user agent

  if(!username) { // Check if username is provided
    return res.status(400).json({ status: 'error', message: 'Username is required!', code: 'auth/username-required' });
  }
  if(!password) { // Check if password is provided
    return res.status(400).json({ status: 'error', message: 'Password is required!', code: 'auth/password-required' });
  }
  // Check if user exists
  const userRecords = await conn.query('SELECT * FROM users WHERE username=$1;', [username]);
  if(userRecords.rowCount < 1) {
    return res.status(400).json({ status: 'error', message: 'Wrong username or password!', code: 'auth/invalid-credentials' });
  }
  
  // Check if password is correct
  const user = userRecords.rows[0];
  const isValid = compareSync(password, user.password);
  if(!isValid) {
    return res.status(400).json({ status: 'error', message: 'Wrong username or password!', code: 'auth/invalid-credentials' });
  }

  // Create session
  const token = generateToken(username, ua);
  const session = await conn.query(`INSERT INTO sessions (user_id, token, ua) VALUES ($1, $2, $3) RETURNING *;`, [user.id, token, ua]);

  if(session.rowCount < 1) { // Check if session was created
    return res.status(500).json({ status: 'error', message: 'Failed to create session!', code: 'auth/failed-to-create-session' });
  }

  return res // Send response
    .status(200)
    .cookie('token', session.rows[0].token, { httpOnly: true, sameSite: 'strict', secure: true, expires: new Date(Date.now() + 3600000 * 24 * 7) })
    .json({ status: 'success', data: { token: session.rows[0].token } });
}
