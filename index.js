import express from 'express';
import pg from 'pg';

const app = express();
const port = 3000;

var users = [
  { id: 1, name: "Angela", color: "teal" },
  { id: 2, name: "Jack", color: "powderblue" },
];
var countries = [], total = 0, color = "red";
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

async function addNewUser(name, color) {
  const result = await db.query("INSERT INTO users (name, color) VALUES ($1, $2) RETURNING id", [name, color]);
  console.log(result);
  const userId = result.rows[0].id;
  
  return userId;
}

async function getAllUsersData(currentUserId) {
  users = await getAllUsers();
  var currentUser = users.find(user => user.id == currentUserId);
  countries = await getUsersData(currentUserId);
  total = countries.length;
  color = currentUser.color;
}

app.get("/", async (req, res) => {
  await getAllUsersData(currentUserId);

  res.render("index.ejs", {users: users, total: total, color: color, countries: countries});
});

app.post("/user", (req, res) => {
  if (req.body.add == "new") {
    res.render("new.ejs");
  } else {
    const userId = parseInt(req.body.user);
    currentUserId = userId;

    res.redirect("/");
  }
});

// Adding a new family member
app.post("/new", async (req, res) => {
  const color = req.body.color;
  const name = req.body.name;

  const result = await addNewUser(name, color);
  currentUserId = result;

  res.redirect("/");
});

// Adding a new country
app.post("/add", async (req, res) => {
  const country_name = req.body.country;
  try{ 
    const result = await db.query("SELECT country_code FROM countries WHERE country_name ILIKE $1", [`%${country_name}%`]);
    const country_code = result.rows[0].country_code;

    await db.query("INSERT INTO visited_countries (country_code, user_id) VALUES ($1, $2)", [country_code, currentUserId]);

    res.redirect("/");
  } catch (error) {
    console.error(error);
    await getAllUsersData(currentUserId);
    
    res.render("index.ejs", {users: users, total: total, color: color, countries: countries, error: "Enter the right name of the country"});
  }
});

app.listen(port, () => {
  console.log(`Successfully listening to port ${port}`);
});