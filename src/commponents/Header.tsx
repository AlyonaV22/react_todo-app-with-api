import React, { useEffect, useRef, useState } from 'react';
import { Todo } from '../types/Todo';
import { USER_ID } from '../api/todos';
import cn from 'classnames';
import { ErrorType } from '../types/Errors';

interface Props {
  todos: Todo[];
  setErrorType: (errorType: ErrorType) => void;
  onChangeTodoTask: (todoTask: Todo | null) => void;
  tempTodo: Todo | null;
  addNewTodo: (todo: Todo) => Promise<Todo | void>;
  handleAllCompleted: () => void;
  lengthOfTodo: number;
}

export const Header: React.FC<Props> = props => {
  const {
    todos,
    setErrorType,
    onChangeTodoTask,
    tempTodo,
    addNewTodo,
    handleAllCompleted,
    lengthOfTodo,
  } = props;

  const [todoTask, setTodoTask] = useState('');

  const todoUseRef = useRef<HTMLInputElement>(null);

  const completedTodos = todos.every(todo => todo.completed);

  useEffect(() => {
    if (todoUseRef.current && tempTodo === null) {
      todoUseRef.current.focus();
    }
  }, [tempTodo, lengthOfTodo]);

  const onSubmit = (event: React.FormEvent<HTMLElement>) => {
    event.preventDefault();

    if (!todoTask.trim()) {
      setErrorType(ErrorType.EmptyTitle);

      return;
    }

    const itemTodo: Todo = {
      id: 0,
      userId: USER_ID,
      title: todoTask.trim(),
      completed: false,
    };

    let hasNewTodo = true;

    addNewTodo(itemTodo)
      .catch(() => {
        setErrorType(ErrorType.UnableToAdd);
        hasNewTodo = false;
      })
      .finally(() => {
        if (hasNewTodo) {
          setTodoTask('');
        }

        onChangeTodoTask(null);
      });
  };

  return (
    <>
      <header className="todoapp__header">
        {!!todos.length && (
          <button
            type="button"
            className={cn('todoapp__toggle-all', { active: completedTodos })}
            data-cy="ToggleAllButton"
            onClick={handleAllCompleted}
          />
        )}

        <form onSubmit={onSubmit}>
          <input
            data-cy="NewTodoField"
            type="text"
            className="todoapp__new-todo"
            placeholder="What needs to be done?"
            value={todoTask}
            onChange={event => setTodoTask(event.target.value)}
            ref={todoUseRef}
            disabled={Boolean(tempTodo)}
          />
        </form>
      </header>
    </>
  );
};
