FROM node:14.15.3-alpine as build

WORKDIR /app/
COPY . .
RUN chown node:node . -R
USER node

RUN npm install --no-optional && npm cache clean --force
RUN npm run build

FROM node:14.15.3-alpine as runtime
WORKDIR /app/

RUN chown node:node . -R
USER node
RUN mkdir /app/data && mkdir /app/data/history
COPY --from=build /app/dist/ /app/
COPY --from=build /app/node_modules/ /app/node_modules/

VOLUME /app/data/
ENTRYPOINT ["node", "index.js"]


