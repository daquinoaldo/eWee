FROM node:latest
RUN mkdir -p /usr/src/app/api
WORKDIR /usr/src/app/api
COPY package.json /usr/src/app/api
RUN npm install
#COPY . /usr/src/app
EXPOSE 3000
CMD [ "npm", "start" ]