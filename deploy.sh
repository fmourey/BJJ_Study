#!/usr/bin/env bash
set -e

eval "$(ssh-agent -s)"
trap 'ssh-agent -k >/dev/null 2>&1' EXIT

ssh -A natlan@sas1.ec-m.fr 'ssh-add'
ssh-add -l || true

rm -rf BJJ_Study
git clone https://github.com/fmourey/BJJ_Study.git
cd BJJ_Study/BJJ_Study_backend
rm -rf node_modules
sed -i 's/^const PORT = .*/const PORT = 1025;/' index.js
cd ../BJJ_Study_frontend/src/config
sed -i "s|^export const API_BASE_URL = .*|export const API_BASE_URL = 'http://laurier.aioli.ec-m.fr'|" api.js
cd ../..

npm i
npm run build
cd ../..

ssh -A natlan@sas1.ec-m.fr "ssh laurier@aioli.ec-m.fr 'rm -rf static; rm -rf BJJ_Study_backend'"

scp -r -o ProxyJump=natlan@sas1.ec-m.fr BJJ_Study/BJJ_Study_backend/* laurier@aioli.ec-m.fr:BJJ_Study_backend
scp -r -o ProxyJump=natlan@sas1.ec-m.fr BJJ_Study/BJJ_Study_frontend/dist/* laurier@aioli.ec-m.fr:static

ssh -A natlan@sas1.ec-m.fr "ssh laurier@aioli.ec-m.fr '
  cd BJJ_Study_backend/
  tmux kill-session -t bjj 2>/dev/null || true
  tmux new-session -d -s bjj \"npm i && npm start\"
'"
echo "Déploiement terminé (tmux session: bjj)"