const {GraphQLServer} = require('graphql-yoga')
const mongoose = require('mongoose')

mongoose.connect("mongodb://localhost/test")


const Todo = mongoose.model("Todo", {
    text: String,
    completed: Boolean
})

const typeDefs = `
    type Query{
        hello(name:String):String!
        todos: [Todo]
    }
    type Todo{
        id:ID!
        text:String!
        completed:Boolean!
    }
    type Mutation{
        createTodo(text:String!):Todo
        updateTodo(id:ID!,completed:Boolean!): Boolean
        removeTodo(id:ID!): Boolean
    }
`

const resolvers = {
    Query: {
        hello: (_, {name}) => `Hello ${name || world}`,
        todos: () => Todo.find()
    },
    Mutation: {
        createTodo: async(_, {text}) => {
            const todo = new Todo({text, completed: false})
            await todo.save()
            return todo
        },
        updateTodo: async(_, {id, completed}) => {
            await Todo.findByIdAndUpdate(id, {completed})
            return true
        },
        removeTodo: async(_, {id}) => {
            await Todo.findByIdAndRemove(id)
            return true
        }
    }
}

const server = new GraphQLServer({typeDefs, resolvers})

mongoose.connection.once("open", () => {
    server.start(() => console.log('Server started running at localhost:4000'))
})
