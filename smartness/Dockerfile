FROM python:latest
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app
COPY . /usr/src/app
RUN pip install pymongo
RUN echo '#!/usr/bin/env bash' > start.sh
RUN echo 'nohup python smartd.py 2>1 &' >> start.sh
RUN echo 'nohup python statsd.py 2>1 &' >> start.sh
CMD [ "bash", "start.sh" ]