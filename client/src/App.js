import React, { Component } from 'react';
import gql from "graphql-tag"
import {graphql, compose} from "react-apollo"
import Paper from '@material-ui/core/Paper';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Checkbox from '@material-ui/core/Checkbox';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

const TodosQuery = gql`
  {
    todos{
      id
      text
      completed
    }
  }
`

const UpdateMutation = gql`
  mutation($id:ID!, $completed:Boolean!){
    updateTodo(id: $id, completed: $completed)
  }
`

const RemoveMutation = gql`
  mutation($id:ID!){
    removeTodo(id: $id)
  }
`

const CreateTodoMutation = gql`
  mutation($text:String!){
    createTodo(text: $text){
      id
      text
      completed
    }
  }
`
class App extends Component {
  state = {
    text:''
  };

  createTodo = async text => {
    await this.props.createTodo({
      variables: {
        text
      },
    update: (store, {data: {createTodo}}) => {
      // Read the data from our cache for this query.
      const data = store.readQuery({ query: TodosQuery });
      // Add our comment from the mutation to the end.
      data.todos.unshift(createTodo);
      // Write our data back to the cache.
      store.writeQuery({ query: TodosQuery, data });
    }})

    this.setState({text: ''})
  }

  updateTodo = async todo => {
    await this.props.updateTodo({
      variables: {
        id: todo.id,
        completed: !todo.completed
      },
    update: store => {
      // Read the data from our cache for this query.
      const data = store.readQuery({ query: TodosQuery });
      // Add our comment from the mutation to the end.
      data.todos = data.todos.map(x => x.id === todo.id ? ({
        ...todo,
        completed: !todo.completed
      }) : x)
      // Write our data back to the cache.
      store.writeQuery({ query: TodosQuery, data });
    }})
  };

  removeTodo = async todo => {
    await this.props.removeTodo({
      variables: {
        id: todo.id
      },
    update: store => {
      // Read the data from our cache for this query.
      const data = store.readQuery({ query: TodosQuery });
      // Add our comment from the mutation to the end.
      data.todos = data.todos.filter(x => x.id !== todo.id);
      // Write our data back to the cache.
      store.writeQuery({ query: TodosQuery, data });
    }})
  };

  render() {
    const {data} = this.props

    if(data.loading){
      return <p>Loading...</p>
    }

    return (
      <div style={{display:'flex'}}>
        <TextField
          label="TODO Text"
          margin="normal"
          onChange={(e) => this.setState({text:e.target.value})}
          value={this.state.text}
        />

        <Button color="primary" style={{width: 200, height: 100}} onClick={() => this.createTodo(this.state.text)}>
        Add TODO !
      </Button>

                <div style={{margin:'auto', width:400}}>
            <Paper elevation={2}>
          <List>
          {data.todos.map(todo => (
            <ListItem key={todo.id} role={undefined} dense button onClick={() => this.updateTodo(todo)}>
              <Checkbox
                checked={todo.completed}
                tabIndex={-1}
                disableRipple
              />
              <ListItemText primary={todo.text} />
              <ListItemSecondaryAction>
                <IconButton onClick={() => this.removeTodo(todo)}>
                  <CloseIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List></Paper>
        </div>
      </div>
    );
  }
}

export default compose(
  graphql(CreateTodoMutation, {name: 'createTodo'}),
  graphql(UpdateMutation, {name: 'updateTodo'}),
  graphql(RemoveMutation, {name: 'removeTodo'}),
  graphql(TodosQuery)
)(App)