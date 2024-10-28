FROM node:20-alpine

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/appackage.json

COPY package*.json ./
COPY --chown=node:node . .

USER node
RUN npm install && npm run ui-build

EXPOSE 3000
CMD [ "node", "." ]
