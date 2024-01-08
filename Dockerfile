FROM node:20.10.0-alpine3.19 AS ui-build
WORKDIR /usr/src/app
COPY client/ ./my-app/
# RUN cd my-app && npm install @angular/cli && npm install && npm run build
RUN cd my-app && npm install --force && npm run build-prod

FROM node:20.10.0-alpine3.19 as server-build
WORKDIR /usr
COPY --from=ui-build /usr/src/app/my-app/dist ./dist/client
COPY ["server/package.json", "server/package-lock.json", "server/tsconfig.json", ".env", "./"]
COPY server/src ./src
RUN npm install
RUN npm run build
COPY .env .
CMD npm run start
