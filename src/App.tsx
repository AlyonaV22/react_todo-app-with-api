import React, { useState, useEffect } from 'react';
import { UserWarning } from './UserWarning';
import {
  addTodo,
  deleteTodo,
  getTodos,
  updateTodo,
  USER_ID,
} from './api/todos';

import { Header } from './commponents/Header';
import { Footer } from './commponents/Footer';
import { Errors } from './commponents/Errors';
import { TodoCard } from './commponents/TodoCard';

import { Todo } from './types/Todo';
import { Status } from './types/Status';
import { ErrorType } from './types/Errors';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [filterType, setFilterType] = useState<Status>(Status.All);
  const [errorType, setErrorType] = useState<ErrorType>(ErrorType.EmptyTitle);
  const [tempTodo, setTempTodo] = useState<Todo | null>(null);
  const [todoLoading, setTodoLoading] = useState<Loading>({});

  useEffect(() => {
    const timeoutId = setTimeout(
      () => setErrorType(ErrorType.EmptyTitle),
      3000,
    );

    getTodos()
      .then(setTodos)
      .catch(() => {
        setErrorType(ErrorType.UnableToLoad);
        clearTimeout(timeoutId);
      });

    return () => clearTimeout(timeoutId);
  }, []);

  interface Loading {
    [key: number]: number;
  }

  const loadingTodo = (todoList: Todo[]): Loading => {
    return todoList.reduce((acc: Loading, todo: Todo): Loading => {
      return {
        ...acc,
        [todo.id]: todo.id,
      };
    }, {} as Loading);
  };

  const todoFilter = todos.filter(todo => {
    switch (filterType) {
      case Status.Active:
        return !todo.completed;
      case Status.Completed:
        return todo.completed;
      default:
        return true;
    }
  });

  const addNewTodo = (todoToAdd: Todo): void => {
    setTempTodo(todoToAdd);

    addTodo(todoToAdd)
      .then(todoNew => {
        setTodos(currentTodos => [...currentTodos, todoNew]);
      })
      .catch(() => {
        setErrorType(ErrorType.UnableToAdd);
      })
      .finally(() => {
        setTempTodo(null);
      });
  };

  const deleteTodoItem = (todoId: number): void => {
    deleteTodo(todoId)
      .then(() => {
        setTodos(currentTodos =>
          currentTodos.filter(todo => todo.id !== todoId),
        );
      })
      .catch(() => {
        setErrorType(ErrorType.UnableToDelete);
      })
      .finally(() => {
        setTempTodo(null);
      });
  };

  const updateTodoItems = (
    updateTodoItem: Todo,
    key: keyof Todo,
    value: boolean | string,
  ): Promise<boolean> => {
    return updateTodo({ ...updateTodoItem, [key]: value })
      .then(todoUpdated => {
        setTodos(currentTodos =>
          currentTodos.map(todo =>
            todo.id === updateTodoItem.id ? todoUpdated : todo,
          ),
        );

        return false;
      })
      .catch(() => {
        setErrorType(ErrorType.UnableToUpdate);

        return true;
      });
  };

  const loadedDeleteTodo = (): void => {
    const completedTodos = todos.filter(todo => todo.completed);

    setTodoLoading(loadingTodo(completedTodos));

    Promise.allSettled(
      completedTodos.map(todo => deleteTodo(todo.id).then(() => todo)),
    )
      .then(values => {
        values.forEach(val => {
          if (val.status === 'rejected') {
            setErrorType(ErrorType.UnableToDelete);
          } else {
            setTodos(currentTodos => {
              const todoId = val.value as Todo;

              return currentTodos.filter(todo => todo.id !== todoId.id);
            });
          }
        });
      })
      .finally(() => setTodoLoading({}));
  };

  const handleAllCompleted = (): void => {
    const completedAllTodos = (
      targetTodos: Todo[],
      completed: boolean,
    ): Promise<void> => {
      return Promise.all(
        targetTodos.map(todo => updateTodo({ ...todo, completed })),
      )
        .then(() => {
          setTodos(currentTodos =>
            currentTodos.map(todo =>
              targetTodos.some(t => t.id === todo.id)
                ? { ...todo, completed }
                : todo,
            ),
          );
        })
        .catch(() => {
          setErrorType(ErrorType.UnableToUpdate);
        })
        .finally(() => {
          setTodoLoading({});
        });
    };

    const activeTodos = todos.filter(todo => !todo.completed);

    if (activeTodos.length) {
      setTodoLoading(loadingTodo(activeTodos));
      completedAllTodos(activeTodos, true);
    } else {
      setTodoLoading(loadingTodo(todos));
      completedAllTodos(todos, false);
    }
  };

  const lengthOfTodo = todos.length;

  if (!USER_ID) {
    return <UserWarning />;
  }

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <Header
          todos={todos}
          setErrorType={setErrorType}
          onChangeTodoTask={setTempTodo}
          tempTodo={tempTodo}
          addNewTodo={addNewTodo}
          handleAllCompleted={handleAllCompleted}
          lengthOfTodo={lengthOfTodo}
        />

        <section className="todoapp__main" data-cy="TodoList">
          {todoFilter.map(todo => (
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

        {todos.length > 0 && (
          <Footer
            filterType={filterType}
            onFiltered={setFilterType}
            todos={todos}
            loadedDeleteTodo={loadedDeleteTodo}
            setTodoLoading={setTodoLoading}
          />
        )}
      </div>

      <Errors
        errorType={errorType}
        clearError={() => setErrorType(ErrorType.EmptyTitle)}
      />
    </div>
  );
};
