import express from 'express';
import pg from 'pg';

const app = express();
const port = 3000;

var users = [], countries = [], total = 0, color = "red";
var currentUserId = 1;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));

const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "Udemy",
  password: "myroslav13",
  port: 5432,
});

db.connect();

async function getUsersData(id) {
  const result = await db.query("SELECT country_code FROM visited_countries WHERE user_id = $1", [id]);
  var visited_countries = [];
  result.rows.forEach(el => visited_countries.push(el.country_code));

  return visited_countries;
}

async function getAllUsers() {
  const result = await db.query("SELECT * FROM users");

  return result.rows;
}

app.get("/", async (req, res) => {
  countries = await getUsersData(currentUserId);
  users = await getAllUsers();
  console.log(users);
  total = countries.length;
  color = users[currentUserId-1].color;
  res.render("index.ejs", {users: users, total: total, color: color, countries: countries});
});

app.post("/user", (req, res) => {
  const userId = parseInt(req.body.user);
  currentUserId = userId;

  res.redirect("/");
});

app.listen(port, () => {
  console.log(`Successfully listening to port ${port}`);
});