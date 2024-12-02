import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as formattedMockData from './formatted-mock-data.json';

import App from './App';
import * as fetchReposModule from './fetchRepos';

afterEach(() => {
  // restore the spy created with spyOn
  vi.restoreAllMocks();
});

describe('the repo fetcher UI', () => {
  it('loads and displays a text input', async () => {
    render(<App />);

    const input = screen.getByLabelText('Repository name');

    expect(input).toBeInTheDocument();
  });

  it('can fetch repositories from the API -- Mock implementation', async () => {
    const spy = vi.spyOn(fetchReposModule, 'fetchRepos').mockResolvedValue(formattedMockData);

    const user = userEvent.setup();

    render(<App />);

    const input = screen.getByLabelText('Repository name');

    await user.type(input, 'sonar');

    await waitFor(() => expect(spy).toHaveBeenCalledWith('sonar', expect.any(Function)));
  });

  it('render a list of fetched repositories (with clickable links)', async () => {
    const spy = vi.spyOn(fetchReposModule, 'fetchRepos').mockResolvedValue(formattedMockData);

    const user = userEvent.setup();

    render(<App />);

    const input = screen.getByLabelText('Repository name');

    await user.type(input, 'sonar');

    await waitFor(() => {
      // Second param is a callback
      expect(spy).toHaveBeenCalledWith('sonar', expect.any(Function));
    });

    const repoLink = screen.getByRole('link', {
      textContent: 'SonarSource/sonarqube',
    });

    expect(repoLink).toBeInTheDocument();

    expect(repoLink).toHaveAttribute('href', 'https://github.com/SonarSource/sonarqube');

    expect(repoLink).toHaveAttribute('target', '_blank');
  });
});
