#!/bin/bash
echo "--- ls apps/api/src/modules/ ---"
ls apps/api/src/modules/
echo ""
echo "--- pnpm exec grep -rn \"from '.*\/\(orders\|products\)\/\" apps/api/src ---"
grep -rn "from '.*\/\(orders\|products\)\/" apps/api/src || echo "No matches found."
