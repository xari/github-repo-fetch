import React, { useState, useReducer } from 'react';
import _ from 'lodash';

import { fetchRepos } from './fetchRepos';
import { ReposState } from './types';
import './App.css';

function Card({ owner, avatar_url, html_url, full_name, description, stargazers_count }) {
  return (
    <a className="card-wrapper" href={html_url} target="_blank" rel="noreferrer">
      <img alt={`User img for ${owner}'s profile`} src={avatar_url} />
      <div className="card-content">
        <h2>{full_name}</h2>
        <p>{description}</p>
        <span>⭐ {stargazers_count}</span>
      </div>
    </a>
  );
}

function reduceRepos(state: ReposState, { type, ...repos }: { type: string }) {
  switch (type) {
    case 'clear':
      return {};
    case 'fill':
      return repos;
    case 'increment':
      return {
        ...state,
        items: [...state.items, ...repos.items],
        page: state.page + 1,
      };
    default:
      throw new Error(`Unknown repos action type: ${type}`);
  }
}

function App() {
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [repos, dispatchRepos] = useReducer(reduceRepos, {});

  const handleChange = async (e) => {
    const searchQuery = e.target.value;

    if (searchQuery === '') {
      dispatchRepos({ type: 'clear' }); // User has cleared the input field
    } else {
      setLoading(true);

      fetchRepos(searchQuery, (_error) => setError(true))
        .then((repos) => dispatchRepos({ type: 'fill', ...repos }))
        .then(() => setLoading(false));
    }
  };

  const debounceHandleChange = _.debounce(handleChange, 800);

  const handleClick = async () => {
    const { q, page } = repos;

    setLoading(true);

    fetchRepos(q, (_error) => setError(true), page + 1)
      .then(({ items }) => {
        dispatchRepos({ type: 'increment', items });
      })
      .then(() => setLoading(false));
  };

  const debounceHandleClick = _.debounce(handleClick, 500);

  let statusMessage = null;
  if (loading) {
    statusMessage = <span>Loading...</span>;
  } else if (repos.items?.length === 0) {
    statusMessage = <span className="help-text">No repositories matched that query.</span>;
  }

  let moreContent = null;
  if (repos.items && repos.items.length < repos.total_count) {
    moreContent = (
      <>
        <span>{`${repos.items.length} of ${repos.total_count}`}</span>
        <button onClick={debounceHandleClick}>{loading ? 'Loading...' : 'Load more'}</button>
      </>
    );
  } else if (repos.items && repos.total_count) {
    moreContent = (
      <span>{`All ${repos.items.length} of ${repos.total_count} matching repositories shown.`}</span>
    );
  }

  return (
    <div>
      <label htmlFor="name">
        {'Repository name'}
        <input id="name" onChange={debounceHandleChange} placeholder="Search for repos here" />
      </label>
      {error ? <span className="error-text">Something went wrong.</span> : null}
      {statusMessage}
      <div className="grid">
        {repos.items?.map((repo) => <Card key={repo.html_url} {...repo} />)}
      </div>
      <div className="more-wrapper">{moreContent}</div>
    </div>
  );
}

export default App;
