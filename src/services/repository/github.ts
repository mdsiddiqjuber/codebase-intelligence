const GITHUB_API = "https://api.github.com";

async function githubFetch(url: string) {
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
    },
  });

  if (!response.ok) {
    throw new Error(
      `GitHub API error: ${response.status} ${response.statusText}`
    );
  }

  return response.json();
}

export async function getRepositoryTree(
  owner: string,
  repo: string,
  branch: string
) {
  return githubFetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`
  );
}

export async function getBlob(
  owner: string,
  repo: string,
  sha: string
) {
  return githubFetch(
    `${GITHUB_API}/repos/${owner}/${repo}/git/blobs/${sha}`
  );
}