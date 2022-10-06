const express = require("express")
const cors = require("cors")
const { v4: uuidv4 } = require("uuid") 

const app = express()

app.use(cors( ))
app.use(express.json())

const users = []

function checkExistsUserAccount(request, response, next) {
  const { username } = request.headers 

  const user = users.find(user => user.username === username)

  if(!user) {
    return response.status(404).json({ error: "User don't found." })
  }

  request.user = user 

  return next()
}

app.post("/users", (request, response) => {
  const { name, username } = request.body

  const userAlreadyExists = users.some(user => user.username === username)

  if(userAlreadyExists) {
  return response.status(400).json({ error: "User already exists." })
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    todos : []
  }

  users.push(user)

  return response.status(201).json(user)
})

app.get("/todos", checkExistsUserAccount, (request, response) => {
  const { user } = request 
  return response.json(user.todos)
})

app.post("/todos", checkExistsUserAccount, (request, response) => {
  const { user } = request 

  const { title, deadline } = request.body

  const todo = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo)

  return response.status(201).json(todo)
})

app.put("/todos/:id", checkExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id: todoId } = request.params

  const indexOFTodo = user.todos.findIndex(todo => todo.id === todoId)

  if(indexOFTodo < 0) {
    return response.status(404).json({ error: "Todo don't found" })
  }

  const todoToChangeInfo = user.todos[indexOFTodo]

  title ? todoToChangeInfo.title = title : false 
  deadline ? todoToChangeInfo.deadline = deadline : false 

  return response.status(201).json(todoToChangeInfo)
})

app.patch("/todos/:id/done", checkExistsUserAccount, (request, response) => {
  const { user } = request 
  const { id: todoId } = request.params
  
  const indexOFTodo = user.todos.findIndex(todo => todo.id === todoId)

  if(indexOFTodo < 0) {
    return response.status(404).json({ error: "Todo don't found." })
  }

  user.todos[indexOFTodo].done = true

  return response.status(201).json(user.todos[indexOFTodo])
})

app.delete("/todos/:id", checkExistsUserAccount, (request, response ) => {
  const { user } = request
  const { id: todoId } = request.params

  const indexOFTodo = user.todos.findIndex(todo => todo.id === todoId)

  if(indexOFTodo < 0) {
    return response.status(404).json({ error: "Todo don't found. "})
  }

  user.todos.splice(indexOFTodo, 1)

  return response.status(204).send()
})
 
module.exports = app

