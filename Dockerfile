FROM node:latest
ENV MONGO=mongo
#Atlante
RUN mkdir -p /usr/src/app/database
WORKDIR /usr/src/app/database
COPY database /usr/src/app/database
RUN npm install
# API
RUN mkdir -p /usr/src/app/api
WORKDIR /usr/src/app/api
COPY api /usr/src/app/api
RUN npm install
# Start
EXPOSE 3000
CMD [ "npm", "start" ]