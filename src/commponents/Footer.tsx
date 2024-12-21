import React, { useMemo } from 'react';
import cn from 'classnames';
import { Status } from '../types/Status';
import { Todo } from '../types/Todo';

interface LoadingTodo {
  [key: number]: number;
}

interface Props {
  filterType: Status;
  onFiltered: (filter: Status) => void;
  todos: Todo[];
  loadedDeleteTodo: () => void;
  setTodoLoading: React.Dispatch<React.SetStateAction<LoadingTodo>>;
}

export const Footer: React.FC<Props> = props => {
  const { filterType, onFiltered, todos, loadedDeleteTodo, setTodoLoading } =
    props;

  const countTodo = useMemo(
    () => todos.filter(todo => !todo.completed).length,
    [todos],
  );

  const onTodoCompleted = useMemo(
    () => todos.some(todo => todo.completed),
    [todos],
  );
  let onCompletedDelete = false;

  const deleteCompletedTodo = () => {
    setTodoLoading({});
    onCompletedDelete = true;
    loadedDeleteTodo();
  };

  const filtersValue = useMemo(() => Object.values(Status), []);

  return (
    <footer className="todoapp__footer" data-cy="Footer">
      <span className="todo-count" data-cy="TodosCounter">
        {countTodo} items left
      </span>
      <nav className="filter" data-cy="Filter">
        {filtersValue.map(filter => (
          <a
            key={filter}
            href={`#/${filter !== Status.All && filter.toLowerCase()}`}
            className={cn('filter__link', {
              selected: filter === filterType,
            })}
            data-cy={`FilterLink${filter}`}
            onClick={() => onFiltered(filter)}
          >
            {filter}
          </a>
        ))}
      </nav>
      <button
        type="button"
        className="todoapp__clear-completed"
        data-cy="ClearCompletedButton"
        disabled={onCompletedDelete || !onTodoCompleted}
        style={{ visibility: !onTodoCompleted ? 'hidden' : 'visible' }}
        onClick={deleteCompletedTodo}
      >
        Clear completed
      </button>
    </footer>
  );
};
