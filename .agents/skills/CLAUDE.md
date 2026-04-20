# Claude Instructions

## Push Behavior
When the user asks to "push", always push to **both** remotes:
1. `https://github.com/Twindix/twindix-performace-indicator.git`
2. `https://github.com/hazem-rboua/Pr-Manage-front.git`

Both are configured as push URLs on `origin`. A single `git push origin <branch>` pushes to both simultaneously.
