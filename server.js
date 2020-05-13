require('dotenv').config();
const client = require('./lib/client');

// Initiate database connection
client.connect();
const app = require('./lib/app');
const PORT = process.env.PORT || 7890;


const ensureAuth = require('./lib/auth/ensure-auth');
const createAuthRoutes = require('./lib/auth/create-auth-routes');

const authRoutes = createAuthRoutes({
  selectUser(email) {
    return client.query(`
            SELECT id, email, hash
            FROM users
            WHERE email = $1;
        `,
    [email]
    ).then(result => result.rows[0]);
  },
  insertUser(user, hash) {
    console.log(user);
    return client.query(`
            INSERT into users (email, hash)
            VALUES ($1, $2)
            RETURNING id, email;
        `,
    [user.email, hash]
    ).then(result => result.rows[0]);
  }
});

app.use('/auth', authRoutes);
app.use('/api', ensureAuth);


app.get('/api/tasks', async(req, res) => {
  const data = await client.query('SELECT * from tasks WHERE owner_id=$1', [req.userId]);


  res.json(data.rows);
});

app.post('/api/tasks', async(req, res) => {
  const data = await client.query(`
  INSERT INTO tasks (name, urgency_level, owner_id)
  VALUES ($1, $2, $3)
  RETURNING *
  `, [req.body.name, req.body.urgency_level, req.userId]);


  res.json(data.rows);
});

app.put('/api/tasks/:id', async(req, res) => {
  const data = await client.query(`
  UPDATE tasks
  SET is_complete=true
  WHERE id=$1 AND owner_id=$2
  RETURNING *
  `, [req.params.id, req.userId]);


  res.json(data.rows);
});


app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Started on ${PORT}`);
});

module.exports = app;
