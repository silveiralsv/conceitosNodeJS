const express = require("express");
const cors = require("cors");
const { uuid, isUuid } = require("uuidv4")

const app = express();

app.use(express.json());
app.use(cors());

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

const repositories = [];

app.use(logRequest);
app.use('/repositories/:id', validateId);

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

  console.log('🍗🍗🍗🍗' + JSON.stringify(repository));
  

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

module.exports = app;
