// Single GraphQL round-trip for everything the cards need: profile, repos
// (paginated, owner-affiliated so private repos count), pinned repos, and the
// full contributionsCollection. With a `repo`-scoped token the contribution
// calendar and commit totals include private repositories.

const GRAPHQL_API = "https://api.github.com/graphql";

const MAIN_QUERY = `
query ($repoCursor: String) {
  viewer {
    login
    name
    createdAt
    followers { totalCount }
    repositories(first: 100, after: $repoCursor, ownerAffiliations: OWNER) {
      totalCount
      pageInfo { hasNextPage endCursor }
      nodes { stargazerCount forkCount isFork }
    }
    pinnedItems(first: 6, types: REPOSITORY) {
      nodes {
        ... on Repository {
          name
          description
          url
          stargazerCount
          forkCount
          pushedAt
          primaryLanguage { name color }
        }
      }
    }
    contributionsCollection {
      totalCommitContributions
      totalPullRequestContributions
      totalIssueContributions
      totalPullRequestReviewContributions
      restrictedContributionsCount
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount }
        }
      }
    }
  }
}`;

async function gql(query, variables = {}) {
    const token = process.env.GITHUB_TOKEN;
    if (!token) throw new Error("Missing GITHUB_TOKEN");

    const res = await fetch(GRAPHQL_API, {
        method: "POST",
        headers: {
            Authorization: `bearer ${token}`,
            "Content-Type": "application/json",
            "User-Agent": "profile-stats",
        },
        body: JSON.stringify({ query, variables }),
    });

    if (!res.ok) throw new Error(`GitHub GraphQL error: ${res.status}`);
    const json = await res.json();
    if (json.errors)
        throw new Error(`GitHub GraphQL: ${JSON.stringify(json.errors)}`);
    return json.data;
}

// Streaks + calendar summary derived from the flat, date-ordered day list.
export function deriveCalendarStats(weeks) {
    const days = weeks.flat();

    let longestStreak = 0;
    let run = 0;
    for (const d of days) {
        if (d.count > 0) {
            run += 1;
            if (run > longestStreak) longestStreak = run;
        } else {
            run = 0;
        }
    }

    // Trailing run from the most recent day backwards. Today having no commits
    // yet shouldn't zero the streak, so skip a trailing 0 on the last day.
    let currentStreak = 0;
    let i = days.length - 1;
    if (i >= 0 && days[i].count === 0) i -= 1;
    for (; i >= 0; i--) {
        if (days[i].count > 0) currentStreak += 1;
        else break;
    }

    let activeDays = 0;
    let busiest = { date: null, count: 0 };
    for (const d of days) {
        if (d.count > 0) activeDays += 1;
        if (d.count > busiest.count) busiest = { date: d.date, count: d.count };
    }

    return { currentStreak, longestStreak, activeDays, busiest, totalDays: days.length };
}

export async function fetchGitHubData() {
    // First page carries everything; extra pages only re-fetch the repo list.
    const first = await gql(MAIN_QUERY);
    const viewer = first.viewer;

    let repoNodes = [...viewer.repositories.nodes];
    let pageInfo = viewer.repositories.pageInfo;
    while (pageInfo.hasNextPage) {
        const next = await gql(MAIN_QUERY, { repoCursor: pageInfo.endCursor });
        repoNodes = repoNodes.concat(next.viewer.repositories.nodes);
        pageInfo = next.viewer.repositories.pageInfo;
    }

    let totalStars = 0;
    let totalForks = 0;
    for (const repo of repoNodes) {
        if (repo.isFork) continue;
        totalStars += repo.stargazerCount;
        totalForks += repo.forkCount;
    }

    const pinned = viewer.pinnedItems.nodes
        .filter((n) => n && n.name)
        .map((n) => ({
            name: n.name,
            description: n.description || "",
            url: n.url,
            stars: n.stargazerCount,
            forks: n.forkCount,
            pushedAt: n.pushedAt,
            language: n.primaryLanguage?.name || null,
            languageColor: n.primaryLanguage?.color || "#8b93a7",
        }));

    const col = viewer.contributionsCollection;
    const cal = col.contributionCalendar;
    const weeks = cal.weeks.map((w) =>
        w.contributionDays.map((d) => ({
            date: d.date,
            count: d.contributionCount,
        })),
    );

    return {
        user: {
            login: viewer.login,
            name: viewer.name,
            createdAt: viewer.createdAt,
            followers: viewer.followers.totalCount,
        },
        repoCount: viewer.repositories.totalCount,
        totalStars,
        totalForks,
        pinned,
        contributions: {
            weeks,
            total: cal.totalContributions,
            // restricted covers private activity when the token can't see repo
            // details; with a repo-scoped token it is simply 0.
            commits: col.totalCommitContributions + col.restrictedContributionsCount,
            prs: col.totalPullRequestContributions,
            issues: col.totalIssueContributions,
            reviews: col.totalPullRequestReviewContributions,
            ...deriveCalendarStats(weeks),
        },
    };
}
