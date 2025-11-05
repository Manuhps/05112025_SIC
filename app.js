const express = require("express");
const pino = require("pino");
const pinoHttp = require("pino-http");

const app = express();
app.use(express.json());

// logger setup (uses LOG_LEVEL env or defaults to info)
const logger = pino({ level: process.env.LOG_LEVEL || "info" });
app.use(pinoHttp({ logger }));

// our "database" data
let users = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" }
];

let movies = [
  { id: 1, title: "Treasure Planet", year: 2002 },
  { id: 2, title: "The Matrix", year: 1999 }
];

let reviews = [
  { id: 1, movieId: 1, userId: 2, text: "Very underrated movie!" },
  { id: 2, movieId: 1, userId: 1, text: "Best animated movie ever." },
  { id: 3, movieId: 2, userId: 1, text: "Classic sci-fi." }
];

// health endpoint (useful for Render health checks)
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.get("/movies", (req, res) => res.json(movies));

app.get("/movies/:id", (req, res) => {
  const movie = movies.find(m => m.id === parseInt(req.params.id));
  if (!movie) {
    req.log && req.log.warn({ movieId: req.params.id }, "Movie not found");
    return res.status(404).json({ error: "Movie not found" });
  }

  const movieReviews = reviews.filter(r => r.movieId === movie.id);
  res.json({
    id: movie.id,
    title: movie.title,
    year: movie.year,
    reviews: movieReviews
  });
});

app.get("/reviews/:id", (req, res) => {
  const review = reviews.find(r => r.id === parseInt(req.params.id));
  if (review) {
    res.json(review);
  } else {
    req.log && req.log.warn({ reviewId: req.params.id }, "Review not found");
    res.status(404).json({ error: "Review not found" });
  }
});

app.get("/users", (req, res) => res.json(users));

app.get("/users/:id", (req, res) => {
  const user = users.find(u => u.id === parseInt(req.params.id));
  if (user) {
    res.json(user);
  } else {
    req.log && req.log.warn({ userId: req.params.id }, "User not found");
    res.status(404).json({ error: "User not found" });
  }
});

app.get("/reviews", (req, res) => res.json(reviews));

app.post("/reviews", (req, res) => {
  const newReview = { id: reviews.length + 1, ...req.body };
  reviews.push(newReview);
  req.log && req.log.info({ review: newReview }, "Created review");
  res.status(201).json(newReview);
});

const port = process.env.PORT || 5000;
app.listen(port, () => {
  logger.info({ port }, "Movie App monolith running");
});