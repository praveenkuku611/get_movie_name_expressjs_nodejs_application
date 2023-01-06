const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};
initializeDBAndServer();

const convertToObject1 = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};
const convertToObject2 = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

// API 1
app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `SELECT
      movie_name
    FROM
      movie
    ORDER BY
      movie_id;`;
  const moviesArray = await db.all(getMoviesQuery);
  response.send(moviesArray.map((arrayItem) => convertToObject1(arrayItem)));
});

// API 2
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const addMovieQuery = `INSERT INTO
     movie(director_id,movie_name,lead_actor)
     VALUES(${directorId},'${movieName}','${leadActor}');`;
  const dbResponse = await db.run(addMovieQuery);
  response.send("Movie Successfully Added");
});

// API 3
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMoviesQuery = `SELECT
      *
    FROM
      movie
    WHERE
      movie_id = ${movieId};`;
  const moviesArray = await db.get(getMoviesQuery);
  response.send(convertToObject1(moviesArray));
});

// API 4
app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `
    UPDATE
      movie
    SET
      director_id=${directorId},
      movie_name='${movieName}',
      lead_actor='${leadActor}'
    WHERE
      movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

// API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM 
      movie 
    WHERE
      movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

/// API 6
app.get("/directors/", async (request, response) => {
  const getDirectorsQuery = `SELECT
      *
    FROM
      director
    ORDER BY
      director_id;`;
  const directorsArray = await db.all(getDirectorsQuery);
  response.send(directorsArray.map((arrayItem) => convertToObject2(arrayItem)));
});

/// API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorsMovieQuery = `SELECT
      movie_name AS movieName
    FROM
      movie
    WHERE
      director_id = ${directorId};`;
  const directorMovie = await db.all(getDirectorsMovieQuery);
  response.send(directorMovie);
});

module.exports = app;
