FROM python:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN pip install pymongo==3.5.1
CMD [ "python", "./sensorgen.py" ]