FROM python:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY sensorgen.py /usr/src/app
RUN pip install pymongo==3.5.1
CMD [ "python", "./sensorgen.py" ]