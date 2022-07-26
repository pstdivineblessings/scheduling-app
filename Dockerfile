FROM node:16.13.1

RUN apt-get -q update && apt-get -qy install netcat

RUN mkdir -p /usr/src/node-app/node_modules && chown -R node:node /usr/src/node-app

WORKDIR /usr/src/node-app

COPY package.json ./

USER node

RUN yarn install 

COPY --chown=node:node . .
