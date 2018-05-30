#!/usr/bin/python3
import pymongo
import datetime
import time
import random
import os

# NOTE: uncomment room generation in main to make also the room configuration in db

# configuration and parameters
GENERATION_LOOP_INTERVAL = 10  # seconds
GENERATION_TIMESPAN = datetime.timedelta(minutes=30)
PIR_THRESHOLD = 0.8

# max deviations from trends (absolute values)
NOISE = {
    'temp': 0.5,
    'humidity': 10,
    'light': 40,
    'carbon': 50,
    'pir': 0.1
}

# devices and their sensors
HOME = {
    'aa:bb:cc:dd:ee:ff': {
        'temp': (20, 25),
        'light': (500, 800),
        'carbon': (500, 400)
    },
    'bb:cc:dd:ee:ff:aa': {
        'temp': (15, 22),
        'humidity': (40, 60),
        'light': (700, 400)
    },
    'cc:dd:ee:ff:aa:bb': {
        'temp': (15, 20),
        'humidity': (40, 60),
        'light': (500, 800),
        'pir': (0, 1)
    },
    'dd:ee:ff:aa:bb:cc': {
        'temp': (15, 20),
        'humidity': (40, 60),
        'light': (500, 800),
        'carbon': (400, 900)
    },
    '00:11:22:33:44:55': {
        'light': (500, 800),
        'pir': (0.8, 0)
    },
    '00:69:69:69:69:00': {
        'temp': (15, 20),
        'humidity': (40, 60)
    }
}

# room -> device associations
BINDINGS = {
    'Bedroom': ['aa:bb:cc:dd:ee:ff'],
    'Kitchen': ['bb:cc:dd:ee:ff:aa'],
    'Bathroom': ['cc:dd:ee:ff:aa:bb'],
    'LivingRoom': ['dd:ee:ff:aa:bb:cc']
}

# database connection
# NOTE: change to db of choice if not local, eg. 'mongodb://p1.aldodaquino.com:27017/'
client = pymongo.MongoClient(os.environ['MONGO']) if 'MONGO' in os.environ else pymongo.MongoClient()
db = client['ewee']


def get_room_of_device(device):
    room = db.rooms.find_one({'things': device})
    return room['_id'] if room else None


def make_configuration_in_db():
    for room, things in BINDINGS.items():
        db.rooms.insert_one({'name': room, 'things': things})


def next_generation(start_time):
    # compute position in linear progression for start to end value
    now = datetime.datetime.utcnow()
    elapsed_time = now - start_time
    interval_position = elapsed_time.total_seconds() / GENERATION_TIMESPAN.total_seconds()
    for device in HOME:
        room = get_room_of_device(device)
        for sensor, interval in HOME[device].items():
            # next value in linear trend
            value = (1 - interval_position) * interval[0] + interval_position * interval[1]
            # +/- random noise
            value += random.triangular(-NOISE[sensor], NOISE[sensor])
            if sensor != 'pir':
                # round to .n decimal digits
                value = round(value, 1)
            else:
                value = (value > PIR_THRESHOLD)
            # insert measure into db
            db.measures.insert_one({'id': device, 'room': room, 'timestamp': now, sensor: value})


if __name__ == "__main__":
    # uncomment to produce entries in room document
    # make_configuration_in_db()
    start_time = datetime.datetime.utcnow()
    while start_time + GENERATION_TIMESPAN > datetime.datetime.utcnow():
        next_generation(start_time)
        time.sleep(GENERATION_LOOP_INTERVAL)
