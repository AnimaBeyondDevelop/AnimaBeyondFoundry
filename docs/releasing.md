# How to publish a release (fork)

1. Make sure all changes are committed and pushed to the fork:
   ```bash
   git push fork <branch>
   ```

2. Update the version in `src/system.json` if needed, commit, and push.

3. Push a version tag — this triggers the release workflow:
   ```bash
   git tag v<version>
   git push fork v<version>
   ```

4. GitHub Actions will:
   - Run `npm run build:prod`
   - Zip `dist/` → `animabf.zip`
   - Create a GitHub Release on the fork with `animabf.zip` and `system.json` attached

The release will be visible at:
`https://github.com/LarsLTS/AnimaBeyondFoundry/releases`
