import React from 'react';
import { Todo } from '../types/Todo';
import { TodoCard } from './TodoCard';

interface Props {
  todos: Todo[];
  tempTodo: Todo | null;
  todoLoading: { [key: number]: number };
  deleteTodoItem: (todoId: number) => Promise<void>;
  updateTodoItems: (
    updateTodoItem: Todo,
    key: keyof Todo,
    value: boolean | string,
  ) => Promise<boolean>;
}

export const TodoList: React.FC<Props> = ({
  todos,
  tempTodo,
  todoLoading,
  deleteTodoItem,
  updateTodoItems,
}) => {
  return (
    <section className="todoapp__main" data-cy="TodoList">
      {todos.map(todo => (
        <TodoCard
          key={todo.id}
          todo={todo}
          deleteTodoItem={deleteTodoItem}
          updateTodoItems={updateTodoItems}
          todoLoading={todoLoading}
        />
      ))}

      {tempTodo && (
        <TodoCard
          todo={tempTodo}
          updateTodoItems={updateTodoItems}
          deleteTodoItem={deleteTodoItem}
          todoLoading={todoLoading}
        />
      )}
    </section>
  );
};
