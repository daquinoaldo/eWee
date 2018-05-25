FROM node:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN npm install
RUN npm run build
RUN find . ! -name 'ESTIA' -type f -exec rm -f {} +
WORKDIR /usr/src/app/ESTIA
RUN npm install
CMD [ "npm", "start" ]