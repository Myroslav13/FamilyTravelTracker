import express from 'express';

const app = express();
const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.static("views"));

app.get("/", (req, res) => {
  res.render("index.ejs", {users: [], total: 0, color: "red", countries: []});
});

app.listen(port, () => {
  console.log(`Successfully listening to port ${port}`);
});