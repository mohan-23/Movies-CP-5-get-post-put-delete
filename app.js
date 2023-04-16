const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "moviesData.db");

const app = express();
app.use(express.json());

let db = null;

const initializeDBServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at: http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};
initializeDBServer();

let convertDBToObject = (object) => {
  return {
    movieId: object.movie_id,
    directorId: object.director_id,
    movieName: object.movie_name,
    leadActor: object.lead_actor,
  };
};

//API 1 Get movieNames API
app.get("/movies/", async (request, response) => {
  const getMovieQuery = `SELECT movie_name FROM movie;`;
  const movieNames = await db.all(getMovieQuery);
  response.send(movieNames.map((eachPlayer) => convertDBToObject(eachPlayer)));
});

//API 2 Post movieObject API
app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  //const { directorId } = request.params;
  const postMovieQuery = `INSERT INTO 
                             movie (director_id, movie_name, lead_actor)
                          VALUES ('${directorId}', '${movieName}', '${leadActor}');`;
  const movieObject = await db.run(postMovieQuery);
  response.send("Movie Successfully Added");
});

//API 3 Get movieObject through movieId API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieObject = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieObject = await db.get(getMovieObject);
  let object = convertDBToObject(movieObject);
  response.send(object);
});

//API 4 Update movieObject through movieId
app.put("/movies/:movieId/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const putMovieQuery = `UPDATE movie
                            SET director_id = ${directorId},
                                movie_name = '${movieName}',
                                lead_actor = '${leadActor}'
                            WHERE movie_id = ${movieId};`;
  const movieObject = await db.run(putMovieQuery);
  response.send("Movie Details Updated");
});

//API 5 Delete movieObject through movieId
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId};`;
  const deleteObject = await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

const convertDbToObjectResponse = (object) => {
  return {
    directorId: object.director_id,
    directorName: object.director_name,
  };
};

//API 6 Get all Directors
app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `SELECT * FROM director;`;
  const directorObjects = await db.all(getDirectorQuery);
  response.send(
    directorObjects.map((eachObject) => convertDbToObjectResponse(eachObject))
  );
});

//API 7 GetObjectFromOnlyMovieName
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getDirectorQuery = `SELECT movie_name AS movieName FROM movie
                            WHERE director_id = ${directorId};`;
  const directorObjects = await db.all(getDirectorQuery);
  response.send(directorObjects);
});

module.exports = app;
