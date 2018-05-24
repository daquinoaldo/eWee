#!/usr/bin/python3
import pymongo
import datetime

# database connection
client = pymongo.MongoClient()
db = client['mcps']

# configuration and parameters
actuator = 'aa:bb:cc:dd:ee:ff'
actuator_type = 'blink'
value = 'on'
interval_from_now = datetime.timedelta(hours=1, minutes=10)

# do the thing
db.actions.insert_one({'room': None, 'timestamp': datetime.datetime.utcnow() + interval_from_now, 'agent': 'aldo', 'id': actuator, actuator_type: value})
