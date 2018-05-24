FROM python:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN pip install pymongo
CMD [ "python", "./sensorgen.py" ]