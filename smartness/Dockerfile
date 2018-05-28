FROM python:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN pip install pymongo==3.5.1
RUN echo '#!/usr/bin/env bash' > start.sh
RUN echo 'python smartd.py &' >> start.sh
RUN echo 'python statsd.py' >> start.sh
CMD [ "bash", "start.sh" ]