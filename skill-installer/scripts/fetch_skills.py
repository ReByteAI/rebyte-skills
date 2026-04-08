#!/usr/bin/env python3
"""
Fetch skill lists from GitHub repositories and SkillsMP marketplace.

Sources:
- GitHub repos (7 repositories) via gh CLI, cache, or GITHUB_TOKEN
- SkillsMP (skillsmp.com) via API - keyword search and AI semantic search

Use --online to fetch real-time data, otherwise uses cache.
"""

import json
import os
import sys
import subprocess
import base64
import re
import ssl
import urllib.request
import urllib.error
import urllib.parse
from pathlib import Path


def _get_ssl_context() -> ssl.SSLContext:
    """Create SSL context, preferring certifi if available."""
    try:
        import certifi
        return ssl.create_default_context(cafile=certifi.where())
    except ImportError:
        return ssl.create_default_context()

# GitHub token from environment (fallback)
GITHUB_TOKEN = os.environ.get("GITHUB_TOKEN") or os.environ.get("GH_TOKEN")

# SkillsMP API — public marketplace key, intentionally embedded for distribution with this skill.
# Override via SKILLSMP_API_KEY env var if you have your own key.
SKILLSMP_API_KEY = os.environ.get("SKILLSMP_API_KEY", "sk_live_skillsmp_YuKhZ2BuBefq5W456mxtBU1NGkxQS7wNtmc88BJx0SU")
SKILLSMP_BASE_URL = "https://skillsmp.com/api/v1"

# Cache file path
CACHE_FILE = Path(__file__).parent.parent / "references" / "skills_cache.json"

# All 7 repositories
REPOSITORIES = {
    "anthropics/skills": {"skills_path": "skills", "branch": "main", "type": "skills"},
    "obra/superpowers": {"skills_path": "skills", "branch": "main", "type": "skills"},
    "vercel-labs/agent-skills": {"skills_path": "skills", "branch": "main", "type": "skills"},
    "K-Dense-AI/claude-scientific-skills": {"skills_path": "scientific-skills", "branch": "main", "type": "skills"},
    "ComposioHQ/awesome-claude-skills": {"skills_path": ".", "branch": "master", "type": "skills"},
    "travisvn/awesome-claude-skills": {"branch": "main", "type": "curated_list"},
    "BehiSecc/awesome-claude-skills": {"branch": "main", "type": "curated_list"},
}


def check_gh_cli() -> bool:
    """Check if gh CLI is available and authenticated."""
    try:
        result = subprocess.run(["gh", "auth", "status"], capture_output=True, text=True, timeout=5)
        return result.returncode == 0
    except:
        return False


def gh_api(endpoint: str) -> dict | list | None:
    """Make GitHub API request via gh CLI."""
    try:
        result = subprocess.run(
            ["gh", "api", endpoint],
            capture_output=True, text=True, timeout=30
        )
        if result.returncode == 0:
            return json.loads(result.stdout)
    except Exception as e:
        print(f"gh api error: {e}", file=sys.stderr)
    return None


def http_api(url: str) -> dict | list | None:
    """Make GitHub API request via HTTP (with optional token)."""
    req = urllib.request.Request(url)
    req.add_header("Accept", "application/vnd.github.v3+json")
    req.add_header("User-Agent", "Rebyte-Skill-Installer")
    if GITHUB_TOKEN:
        req.add_header("Authorization", f"token {GITHUB_TOKEN}")
    try:
        ctx = _get_ssl_context()
        with urllib.request.urlopen(req, timeout=15, context=ctx) as response:
            return json.loads(response.read().decode())
    except urllib.error.HTTPError as e:
        if e.code == 403:
            print(f"Rate limited!", file=sys.stderr)
        return None
    except Exception:
        return None


# Global flag for which API method to use
USE_GH_CLI = False


def api_request(endpoint: str) -> dict | list | None:
    """Make API request using best available method."""
    if USE_GH_CLI:
        return gh_api(endpoint)
    else:
        return http_api(f"https://api.github.com/{endpoint}")


def load_cache() -> dict | None:
    """Load cached skills data."""
    if CACHE_FILE.exists():
        try:
            with open(CACHE_FILE) as f:
                return json.load(f)
        except:
            pass
    return None


def save_cache(data: dict):
    """Save skills data to cache."""
    try:
        CACHE_FILE.parent.mkdir(parents=True, exist_ok=True)
        with open(CACHE_FILE, "w") as f:
            json.dump(data, f, indent=2)
        print(f"✓ Cache updated", file=sys.stderr)
    except Exception as e:
        print(f"Warning: Could not save cache: {e}", file=sys.stderr)


def check_rate_limit() -> dict:
    """Check current rate limit status."""
    data = api_request("rate_limit")
    if data:
        core = data.get("rate", {})
        return {"remaining": core.get("remaining", 0), "limit": core.get("limit", 0)}
    return {"remaining": 0, "limit": 0}


def fetch_repo_info(owner: str, repo: str) -> dict | None:
    data = api_request(f"repos/{owner}/{repo}")
    if data:
        return {"stars": data.get("stargazers_count", 0), "description": data.get("description", ""), "url": data.get("html_url", "")}
    return None


def fetch_readme(owner: str, repo: str, branch: str) -> str:
    data = api_request(f"repos/{owner}/{repo}/contents/README.md?ref={branch}")
    if data and data.get("encoding") == "base64":
        return base64.b64decode(data["content"]).decode("utf-8")
    return ""


def parse_readme_skills(readme_content: str) -> list:
    skills = []
    patterns = [
        r'\[([^\]]+)\]\((https://github\.com/[^)]+)\)\s*[-–—:]\s*(.+?)(?=\n|$)',
        r'\*\s*\[([^\]]+)\]\((https://github\.com/[^)]+)\)',
    ]
    for pattern in patterns:
        for match in re.finditer(pattern, readme_content, re.MULTILINE):
            name = match.group(1).strip()
            url = match.group(2).strip()
            desc = match.group(3).strip() if len(match.groups()) > 2 else ""
            if any(x in url.lower() for x in ['badge', 'shields.io', 'profile', 'twitter', 'linkedin']):
                continue
            import_url = f"https://manus.im/app#settings/skills/import?githubUrl={url}" if '/tree/' in url or url.count('/') >= 4 else ""
            skills.append({"name": name, "description": desc[:200], "github_url": url, "import_url": import_url, "source": "readme"})
    return skills


def fetch_skill_directories(owner: str, repo: str, skills_path: str, branch: str) -> list | None:
    data = api_request(f"repos/{owner}/{repo}/git/trees/{branch}?recursive=1")
    if not data or "tree" not in data:
        return None
    skills = set()
    prefix = f"{skills_path}/" if skills_path != "." else ""
    for item in data["tree"]:
        path = item["path"]
        if skills_path == ".":
            if path.endswith("/SKILL.md") and path.count("/") == 1:
                skills.add(path.split("/")[0])
        else:
            if path.startswith(prefix) and path.endswith("/SKILL.md"):
                parts = path[len(prefix):].split("/")
                if len(parts) == 2:
                    skills.add(parts[0])
    return sorted(skills)


def generate_import_url(owner: str, repo: str, skill_name: str, skills_path: str, branch: str) -> str:
    if skills_path == ".":
        github_url = f"https://github.com/{owner}/{repo}/tree/{branch}/{skill_name}"
    else:
        github_url = f"https://github.com/{owner}/{repo}/tree/{branch}/{skills_path}/{skill_name}"
    return f"https://manus.im/app#settings/skills/import?githubUrl={github_url}"


def fetch_online() -> dict:
    """Fetch fresh data from GitHub API."""
    print("Fetching real-time data from GitHub...", file=sys.stderr)
    result = {}
    
    for repo_key, config in REPOSITORIES.items():
        owner, repo = repo_key.split("/")
        branch = config["branch"]
        
        repo_info = fetch_repo_info(owner, repo)
        if not repo_info:
            print(f"  ✗ {repo_key}", file=sys.stderr)
            continue
        
        print(f"  ✓ {repo_key} (⭐{repo_info['stars']})", file=sys.stderr)
        
        if config["type"] == "curated_list":
            readme = fetch_readme(owner, repo, branch)
            result[repo_key] = {
                "stars": repo_info["stars"], "description": repo_info["description"],
                "url": repo_info["url"], "type": "curated_list",
                "skills": parse_readme_skills(readme) if readme else []
            }
        else:
            skills_path = config["skills_path"]
            skill_names = fetch_skill_directories(owner, repo, skills_path, branch) or []
            skills = []
            for name in skill_names:
                github_url = f"https://github.com/{owner}/{repo}/tree/{branch}/{skills_path}/{name}" if skills_path != "." else f"https://github.com/{owner}/{repo}/tree/{branch}/{name}"
                skills.append({"name": name, "github_url": github_url, "import_url": generate_import_url(owner, repo, name, skills_path, branch)})
            result[repo_key] = {
                "stars": repo_info["stars"], "description": repo_info["description"],
                "url": repo_info["url"], "type": "skills", "skills": skills
            }
    
    if result:
        save_cache(result)
    return result


def search_skills(keyword: str, all_repos: dict) -> list:
    keyword_lower = keyword.lower()
    matches = []
    for repo_key, repo_data in all_repos.items():
        for skill in repo_data.get("skills", []):
            if keyword_lower in skill["name"].lower() or keyword_lower in skill.get("description", "").lower():
                matches.append({**skill, "repository": repo_key, "stars": repo_data["stars"], "repo_type": repo_data["type"]})
    return matches


def deep_dive(repo_key: str, skill_name: str) -> dict:
    """Fetch SKILL.md content."""
    if repo_key not in REPOSITORIES:
        return {"error": f"Unknown repository: {repo_key}"}
    config = REPOSITORIES[repo_key]
    if config["type"] == "curated_list":
        return {"error": f"{repo_key} is a curated list - visit github_url directly"}
    
    owner, repo = repo_key.split("/")
    skills_path = config["skills_path"]
    branch = config["branch"]
    
    endpoint = f"repos/{owner}/{repo}/contents/{skills_path}/{skill_name}/SKILL.md?ref={branch}" if skills_path != "." else f"repos/{owner}/{repo}/contents/{skill_name}/SKILL.md?ref={branch}"
    
    data = api_request(endpoint)
    if not data:
        return {"error": "Could not fetch SKILL.md"}
    
    if data.get("encoding") == "base64":
        content = base64.b64decode(data["content"]).decode("utf-8")
        description = ""
        in_fm = False
        for line in content.split("\n"):
            if line.strip() == "---":
                in_fm = not in_fm
                if not in_fm: break
            elif in_fm and line.startswith("description:"):
                description = line.replace("description:", "").strip().strip('"\'')
        
        github_url = f"https://github.com/{owner}/{repo}/tree/{branch}/{skills_path}/{skill_name}" if skills_path != "." else f"https://github.com/{owner}/{repo}/tree/{branch}/{skill_name}"
        return {"name": skill_name, "repository": repo_key, "description": description, "content": content, "github_url": github_url, "import_url": generate_import_url(owner, repo, skill_name, skills_path, branch)}
    return {"error": "Could not decode SKILL.md"}


def format_stars(count: int) -> str:
    return f"{count/1000:.1f}k".replace(".0k", "k") if count >= 1000 else str(count)


def skillsmp_request(endpoint: str, params: dict) -> dict:
    """Make a request to SkillsMP API."""
    query = urllib.parse.urlencode(params)
    url = f"{SKILLSMP_BASE_URL}/{endpoint}?{query}"
    req = urllib.request.Request(url)
    req.add_header("Authorization", f"Bearer {SKILLSMP_API_KEY}")
    req.add_header("User-Agent", "Rebyte-Skill-Installer")
    ctx = _get_ssl_context()
    try:
        with urllib.request.urlopen(req, timeout=30, context=ctx) as response:
            body = response.read().decode()
            try:
                return json.loads(body)
            except (json.JSONDecodeError, ValueError):
                print(f"SkillsMP returned non-JSON response: {body[:200]}", file=sys.stderr)
                raise
    except urllib.error.HTTPError as e:
        err_body = e.read().decode()
        try:
            err = json.loads(err_body)
            code = err.get("error", {}).get("code", "")
            msg = err.get("error", {}).get("message", "")
            print(f"SkillsMP error: {code} - {msg}", file=sys.stderr)
        except (json.JSONDecodeError, ValueError):
            print(f"SkillsMP HTTP {e.code}", file=sys.stderr)
        raise
    except urllib.error.URLError as e:
        if "CERTIFICATE_VERIFY_FAILED" in str(e.reason):
            print("SSL certificate verification failed. Fix: pip install certifi, or run 'Install Certificates' for your Python.", file=sys.stderr)
        else:
            print(f"SkillsMP connection error: {e.reason}", file=sys.stderr)
        raise


def skillsmp_search(query: str, page: int = 1, limit: int = 20, sort_by: str = "recent") -> dict:
    """Keyword search via SkillsMP API."""
    params = {"q": query, "page": page, "limit": limit, "sortBy": sort_by}
    return skillsmp_request("skills/search", params)


def skillsmp_ai_search(query: str) -> dict:
    """AI semantic search via SkillsMP API."""
    return skillsmp_request("skills/ai-search", {"q": query})


def format_skillsmp_results(data: dict, is_ai: bool) -> list:
    """Normalize SkillsMP results into a common format.

    AI search response shape: data.data.data[] (vector store results with nested skill).
    Keyword search response shape: data.data.skills[] (flat skill list).
    """
    results = []
    if is_ai:
        for item in data.get("data", {}).get("data", []):
            skill = item.get("skill")
            if not skill or not skill.get("name"):
                continue
            entry = {
                "name": skill["name"],
                "author": skill.get("author", ""),
                "description": skill.get("description", ""),
                "github_url": skill.get("githubUrl", ""),
                "skillsmp_url": skill.get("skillUrl", ""),
                "stars": skill.get("stars") or 0,
                "source": "skillsmp-ai",
            }
            if "score" in item:
                entry["score"] = item["score"]
            results.append(entry)
    else:
        for skill in data.get("data", {}).get("skills", []):
            if not skill.get("name"):
                continue
            results.append({
                "name": skill["name"],
                "author": skill.get("author", ""),
                "description": skill.get("description", ""),
                "github_url": skill.get("githubUrl", ""),
                "skillsmp_url": skill.get("skillUrl", ""),
                "stars": skill.get("stars") or 0,
                "source": "skillsmp",
            })
    return results


def print_skillsmp_results(results: list, pagination=None):
    """Print SkillsMP results in human-readable format."""
    for skill in results:
        stars = format_stars(skill["stars"])
        author = f" by {skill['author']}" if skill["author"] else ""
        score_str = f" [score: {skill['score']:.2f}]" if "score" in skill else ""
        print(f"  {skill['name']}{author} ({stars}){score_str}")
        if skill.get("description"):
            print(f"    {skill['description'][:120]}")
        if skill.get("github_url"):
            print(f"    GitHub: {skill['github_url']}")
        if skill.get("skillsmp_url"):
            print(f"    SkillsMP: {skill['skillsmp_url']}")
        print()
    if pagination:
        page = pagination.get("page", 1)
        total_pages = pagination.get("totalPages", 1)
        total = pagination.get("total", 0)
        print(f"  Page {page}/{total_pages} ({total} total)")
        if pagination.get("hasNext"):
            print(f"  Use --page {page + 1} for next page")


def main():
    global USE_GH_CLI
    
    import argparse
    parser = argparse.ArgumentParser(description="Skill Finder")
    parser.add_argument("--list", "-l", action="store_true", help="List all skills")
    parser.add_argument("--search", "-s", help="Search skills by keyword")
    parser.add_argument("--deep-dive", "-d", nargs=2, metavar=("REPO", "SKILL"), help="Fetch SKILL.md")
    parser.add_argument("--online", "-o", action="store_true", help="Fetch real-time data")
    parser.add_argument("--rate-limit", "-r", action="store_true", help="Check rate limit")
    parser.add_argument("--json", "-j", action="store_true", help="Output JSON")
    # SkillsMP options
    parser.add_argument("--skillsmp", help="Search SkillsMP marketplace by keyword")
    parser.add_argument("--ai-search", help="AI semantic search via SkillsMP")
    parser.add_argument("--page", type=int, default=1, help="Page number for SkillsMP (default: 1)")
    parser.add_argument("--limit", type=int, default=20, help="Results per page for SkillsMP (default: 20, max: 100)")
    parser.add_argument("--sort", choices=["stars", "recent"], default="recent", help="Sort order for SkillsMP (default: recent)")
    args = parser.parse_args()

    # SkillsMP commands don't need GitHub auth — dispatch them first
    # SkillsMP keyword search
    if args.skillsmp:
        if args.limit < 1 or args.limit > 100:
            print("Error: --limit must be between 1 and 100", file=sys.stderr)
            sys.exit(1)
        if args.page < 1:
            print("Error: --page must be >= 1", file=sys.stderr)
            sys.exit(1)
        print(f"Searching SkillsMP for '{args.skillsmp}'...", file=sys.stderr)
        try:
            raw = skillsmp_search(args.skillsmp, page=args.page, limit=args.limit, sort_by=args.sort)
        except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError, ValueError):
            sys.exit(1)
        results = format_skillsmp_results(raw, is_ai=False)
        pagination = raw.get("data", {}).get("pagination")
        if args.json:
            print(json.dumps({"source": "skillsmp", "results": results, "pagination": pagination}, indent=2))
        else:
            total = pagination.get("total", len(results)) if pagination else len(results)
            print(f"\n=== SkillsMP: '{args.skillsmp}' ({total} found) ===\n")
            if not results:
                print("  No results found.")
            else:
                print_skillsmp_results(results, pagination=pagination)
        return

    # SkillsMP AI semantic search
    if args.ai_search:
        if args.page != 1 or args.limit != 20 or args.sort != "recent":
            print("Warning: --page, --limit, and --sort are ignored for --ai-search", file=sys.stderr)
        print(f"AI searching SkillsMP for '{args.ai_search}'...", file=sys.stderr)
        try:
            raw = skillsmp_ai_search(args.ai_search)
        except (urllib.error.HTTPError, urllib.error.URLError, json.JSONDecodeError, ValueError):
            sys.exit(1)
        results = format_skillsmp_results(raw, is_ai=True)
        if args.json:
            print(json.dumps({"source": "skillsmp-ai", "results": results}, indent=2))
        else:
            print(f"\n=== SkillsMP AI Search: '{args.ai_search}' ({len(results)} found) ===\n")
            if not results:
                print("  No results found.")
            else:
                print_skillsmp_results(results)
        return

    # GitHub-based commands — determine API method
    gh_available = check_gh_cli()
    if gh_available:
        USE_GH_CLI = True
        print("✓ Using GitHub Connector (gh CLI) - 15000 req/hr", file=sys.stderr)
    elif GITHUB_TOKEN:
        print("✓ Using GITHUB_TOKEN - 5000 req/hr", file=sys.stderr)
    else:
        print("ℹ No GitHub auth (using cache, or 60 req/hr if --online)", file=sys.stderr)

    if args.rate_limit:
        rate = check_rate_limit()
        print(f"Rate limit: {rate['remaining']}/{rate['limit']}")
        print(f"Cache: {'✓ Available' if CACHE_FILE.exists() else '✗ Not found'}")
        return

    if args.deep_dive:
        repo, skill = args.deep_dive
        result = deep_dive(repo, skill)
        if args.json:
            print(json.dumps(result, indent=2))
        elif "error" in result:
            print(f"Error: {result['error']}")
        else:
            print(f"\n=== {result['name']} ({result['repository']}) ===\n")
            print(f"Description: {result['description']}\n")
            print(f"Import: {result['import_url']}\n")
            print("--- SKILL.md ---\n")
            print(result['content'][:3000])
            if len(result['content']) > 3000:
                print(f"\n... ({len(result['content'])} chars total)")
        return
    
    # Get data - auto real-time if gh CLI available, otherwise cache
    using_cache = False
    if gh_available or args.online:
        all_repos = fetch_online()
        if not all_repos:
            print("Online fetch failed, using cache...", file=sys.stderr)
            all_repos = load_cache() or {}
            using_cache = True
    else:
        all_repos = load_cache()
        using_cache = True
        if not all_repos:
            print("No cache, fetching online...", file=sys.stderr)
            all_repos = fetch_online() or {}
            using_cache = False
    
    if not all_repos:
        print("No data available.")
        return
    
    if args.search:
        matches = search_skills(args.search, all_repos)
        if args.json:
            print(json.dumps({"using_cache": using_cache, "results": matches}, indent=2))
        else:
            print(f"\n=== Skills matching '{args.search}' ({len(matches)} found) ===\n")
            for skill in matches:
                tag = " [README]" if skill.get("source") == "readme" else ""
                print(f"• {skill['name']} ({skill['repository']} ⭐{format_stars(skill['stars'])}){tag}")
                if skill.get("description"):
                    print(f"  {skill['description'][:100]}")
                print(f"  Import: {skill.get('import_url') or skill['github_url']}\n")
            if matches:
                print("💡 --deep-dive REPO SKILL for full description")
    else:
        if args.json:
            print(json.dumps({"using_cache": using_cache, "repositories": all_repos}, indent=2))
        else:
            total_skills = sum(len(r.get("skills", [])) for r in all_repos.values() if r["type"] == "skills")
            total_readme = sum(len(r.get("skills", [])) for r in all_repos.values() if r["type"] == "curated_list")
            print(f"\n=== All Skills ({total_skills} + {total_readme} from READMEs) ===\n")
            
            for repo_key, repo_data in all_repos.items():
                stars = format_stars(repo_data['stars'])
                if repo_data["type"] == "curated_list":
                    print(f"## {repo_key} (⭐{stars}) - CURATED ({len(repo_data.get('skills', []))})")
                    for skill in repo_data.get("skills", [])[:5]:
                        desc = f" - {skill['description'][:40]}..." if skill.get('description') else ""
                        print(f"   • {skill['name']}{desc}")
                    if len(repo_data.get("skills", [])) > 5:
                        print(f"   ... +{len(repo_data['skills']) - 5} more")
                else:
                    print(f"## {repo_key} (⭐{stars}) - {len(repo_data.get('skills', []))} skills")
                    for skill in repo_data.get("skills", []):
                        print(f"   • {skill['name']}")
                print()
            
            print("💡 --search KEYWORD | --skillsmp KEYWORD | --ai-search QUERY | --deep-dive REPO SKILL")


if __name__ == "__main__":
    main()
