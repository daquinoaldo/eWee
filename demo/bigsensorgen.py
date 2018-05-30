#!/usr/bin/python3
import pymongo
import datetime
import random
import os

# NOTE: uncomment room generation in main to make also the room configuration in db

# configuration and parameters
GENERATION_LOOP_NUMBER = 3  # iterations (days)
GENERATION_LOOP_INTERVAL = datetime.timedelta(seconds=20)
GENERATION_TIMESPAN = datetime.timedelta(days=1)
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
        'temp': [(10, 20), (20, 10)],
        'light': [(0, 500), (500, 800), (800, 400), (400, 0)],
        'carbon': [(500, 400)]
    },
    'bb:cc:dd:ee:ff:aa': {
        'temp': [(15, 22), (22, 15)],
        'humidity': [(40, 60)],
        'light': [(0, 500), (500, 800), (800, 400), (400, 0)]
    },
    'cc:dd:ee:ff:aa:bb': {
        'temp': [(15, 20), (20, 25), (25, 15)],
        'humidity': [(40, 60)],
        'light': [(0, 300), (300, 500), (800, 400), (400, 0)],
        'pir': [(0, 0), (0, 1), (0, 0)]
    },
    'dd:ee:ff:aa:bb:cc': {
        'temp': [(16, 20), (20, 16)],
        'humidity': [(40, 60), (60, 40)],
        'light': [(0, 500), (300, 800), (800, 400), (400, 0)],
        'carbon': [(400, 900)]
    },
    '00:11:22:33:44:55': {
        'light': [(0, 500), (500, 800), (800, 400), (400, 0)],
        'pir': [(0, 0), (0, 1), (1, 0), (0, 0)]
    },
    '00:69:69:69:69:00': {
        'temp': [(15, 20)],
        'humidity': [(40, 60)]
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


def next_generation(start_time, now):
    # compute position in linear progression for start to end value
    elapsed_time = now - start_time
    for device in HOME:
        room = get_room_of_device(device)
        for sensor, intervals in HOME[device].items():
            interval_duration = GENERATION_TIMESPAN / len(intervals)
            interval_index = int((now - start_time) / interval_duration)
            interval = intervals[interval_index]
            interval_position = (elapsed_time / interval_duration) - interval_index
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
    make_configuration_in_db()
    start_time = datetime.datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0) - datetime.timedelta(
        days=1)
    start_time -= GENERATION_LOOP_NUMBER * GENERATION_TIMESPAN
    for iteration in range(0, GENERATION_LOOP_NUMBER):
        iteration_start_time = start_time + iteration * GENERATION_TIMESPAN
        iteration_time = iteration_start_time
        while iteration_time < start_time + (iteration + 1) * GENERATION_TIMESPAN:
            next_generation(iteration_start_time, iteration_time)
            iteration_time += GENERATION_LOOP_INTERVAL
