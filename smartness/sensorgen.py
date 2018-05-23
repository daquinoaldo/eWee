#!/usr/bin/python3
import pymongo
import datetime
import time
import random

# NOTE: uncomment room generation in main to make also the room configuration in db

# configuration and parameters
GENERATION_LOOP_INTERVAL = 30 #seconds
GENERATION_TIMESPAN = datetime.timedelta(minutes=30)
PIR_THRESHOLD = 0.8

# max deviations from trends (absoltue values)
NOISE = {
    'temp': 0.5,
    'humidity': 10,
    'light': 40,
    'carbon': 50,
    'pir': 0.1
}

# generation configuration

# list of *real* rooms
ROOMS = ['Bedroom', 'Kitchen', 'Bathroom', 'LivingRoom']
# includes also configuration for rooms not yet configured in db
# for unassociated sensor data generation
GENCONF = {
    'Bedroom': {
        'temp': (20, 25),
        'light': (500, 800),
        'carbon': (500, 400)
    },
    'Kitchen': {
        'temp': (15, 22),
        'humidity': (40, 60),
        'light': (700, 400)
    },
    'Bathroom': {
        'temp': (15, 20),
        'humidity': (40, 60),
        'light': (500, 800),
        'pir': (0, 1)
    },
    'LivingRoom': {
        'temp': (15, 20),
        'humidity': (40, 60),
        'light': (500, 800),
        'carbon': (400, 900)
    },
    'None1': {
        'light': (500, 800),
        'pir': (0.8, 0)
    },
    'None2': {
        'temp': (15, 20),
        'humidity': (40, 60)
    }
}
# room -> sensor associations
SENSORS = {
    'Bedroom': 'aa:bb:cc:dd:ee:ff',
    'Kitchen': 'bb:cc:dd:ee:ff:aa',
    'Bathroom': 'cc:dd:ee:ff:aa:bb',
    'LivingRoom': 'dd:ee:ff:aa:bb:cc',
    'None1': '00:11:22:33:44:55',
    'None2': '00:11:22:33:44:99'
}

# database connection
#NOTE: change to db of choice if not local, eg. 'mongodb://p1.aldodaquino.com:27017/'
client = pymongo.MongoClient()
db = client['mcps']

# get room ids
room_ids = {room['name']: room['_id'] for room in db.rooms.find({})}

def make_configuration_in_db():
    for room in ROOMS:
        room_id = db.rooms.insert_one({'name': room, 'things': [SENSORS[room]]}).inserted_id
        room_ids[room] = room_id

def next_generation(start_time):
    # compute position in linear progression for start to end value
    now = datetime.datetime.utcnow()
    elapsed_time = now - start_time
    interval_position = elapsed_time.total_seconds() / GENERATION_TIMESPAN.total_seconds()
    for room in GENCONF:
        for sensor, interval in GENCONF[room].items():
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
            db.measures.insert_one({'id': SENSORS[room], 'room': room_ids.get(room), 'timestamp': now, sensor: value})


if __name__ == "__main__":
    # uncomment to produce entries in room document
    #make_configuration_in_db()
    start_time = datetime.datetime.utcnow()
    while start_time + GENERATION_TIMESPAN > datetime.datetime.utcnow():
        next_generation(start_time)
        time.sleep(GENERATION_LOOP_INTERVAL)