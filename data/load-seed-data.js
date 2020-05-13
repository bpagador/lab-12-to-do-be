const client = require('../lib/client');
// import our seed data:
const todos = require('./todo.js');
const usersData = require('./users.js');

run();

async function run() {

  try {
    await client.connect();

    const users = await Promise.all(
      usersData.map(user => {
        return client.query(`
                      INSERT INTO users (email, hash)
                      VALUES ($1, $2)
                      RETURNING *;
                  `,
        [user.email, user.hash]);
      })
    );
      
    const user = users[0].rows[0];

    await Promise.all(
      todos.map(todo => {
        return client.query(`
                    INSERT INTO tasks (name, urgency_level, owner_id, is_complete)
                    VALUES ($1, $2, $3, $4);
                `,
        [todo.name, todo.urgency_level, user.id, todo.is_complete]);
      })
    );
    

    console.log('seed data load complete');
  }
  catch(err) {
    console.log(err);
  }
  finally {
    client.end();
  }
    
}
