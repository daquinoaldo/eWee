FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY ../ui /usr/src/app
RUN npm install
RUN npm run build
CMD [ "npm", "start" ]