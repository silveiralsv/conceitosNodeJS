// Importing Express, Cors and uuidv4;
const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4")

// New instance of Express;
const app = express();

// Setting express instance to use JSON; 
app.use(express.json());
app.use(cors());


/*
  Setting some Middleware's, like: 
    -> logRequest:  Here I log every request to the API, showing the [METHOD] and the URL;
    -> validateId:  Here I check every Resource that use the Route Params ':id',
                    looking for valid uuId's;
*/ 
function logRequest(request, response, next) {

  const { method, url} = request;  

  const log = `[${method}] ${url}`

  console.time(log);

  next();

  console.timeEnd(log);

}

function validateId(request, response, next) {
  const { id } = request.params;

  if(!isUuid(id))
    return response.status(400).json({error: 'Invalid repository ID.'});

  return next();
  
} 

// Creating a Array of empty Repo's;
const repositories = [];

// Using the Middeware's( Loggin every Route, and checking routes that receive :id);
app.use(logRequest);
app.use('/repositories/:id', validateId);


/*
  Setting the Routes: 
    ->  Get:  Listing every repositories;

    ->  Post: Creating new repositories. Here we use 'uuid' to provide a unique
              id to the new object, and the rule is 'Every new repo, must initialize
              with 0 likes';

    ->  Put:  Updating 'title', 'url' and 'techs' of a existing repo. Should not 
              update likes, here;

    ->  Delete: Delete a existing repo, by ID. If given an nonexistent repo ID, 
                I return a 400 status code, with a error message;

    ->  Post(:id/like): Able to like repositories, same as Delete if given a 
                        nonexistent repo ID, I return a 400 error code and error
                        Message;          
*/
app.get("/repositories", (request, response) => {
  return response.json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs} = request.body;

  const repository = {
    id: uuid(),
    title,
    url,
    techs,
    likes: 0
  }

  repositories.push(repository);

  return response.json(repository);
});

app.put("/repositories/:id", (request, response) => {
  
  const { title, url, techs } = request.body;
  const { id } = request.params;
  

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);
  
  if(repositoryIndex < 0)
    return response.status(400).json({error: 'Repository not found.'})

  const repository = {
    id,
    title,
    url,
    techs,
    likes: repositories[repositoryIndex].likes
  }

  repositories[repositoryIndex] = repository;

  
  

  return response.json(repositories[repositoryIndex]);
  
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if (repositoryIndex < 0 ) {
    return response.status(400).json({ error : 'Repository not found.'})
  }
    

  repositories.splice(repositoryIndex, 1);

  return response.status(204).send();

});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repositoryIndex = repositories.findIndex(repository => repository.id === id);

  if(repositoryIndex < 0)
    return response.status(400).json({error: 'Repository not found.'})

  repositories[repositoryIndex].likes += 1;
  return response.json(repositories[repositoryIndex]) 
});


// Exporting app, so I can set the listenner at server.js;
module.exports = app;
