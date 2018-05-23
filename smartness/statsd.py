#!/usr/bin/python3
import pymongo
import datetime
import signal
import time

# configuration and parameters
MAIN_LOOP_INTERVAL = datetime.timedelta(minutes=15)

# database connection
client = pymongo.MongoClient()
db = client['mcps']

def get_room_list():
    # returns the list of room IDs
    return [room['_id'] for room in db.rooms.find({})]

def update_hourly_averages():
    room_ids = get_room_list()
    stats = db.measures.aggregate([
        {'$match': {
            'room': {'$in': room_ids}
        }},
        {'$project': {
            'year': {'$year': '$timestamp'},
            'month': {'$month': '$timestamp'},
            'day': {'$dayOfMonth': '$timestamp'},
            'hour': {'$hour': '$timestamp'},
            'room': '$room',
            'temp': '$temp',
            'humidity': '$humidity',
            'light': '$light',
            'carbon': '$carbon',
            'occupied': {'$cond': ['$pir', 1, 0]}
        }},
        {'$group': {
            '_id': {
                'year': '$year',
                'month': '$month',
                'day': '$day',
                'hour': '$hour',
                'room': '$room'
            },
            'temp': {'$avg': '$temp'},
            'humidity': {'$avg': '$humidity'},
            'light': {'$avg': '$light'},
            'carbon': {'$avg': '$carbon'},
            'occupied': {'$avg': '$occupied'}
        }},
        {'$project': {
            '_id': False,
            'year': '$_id.year',
            'month': '$_id.month',
            'day': '$_id.day',
            'hour': '$_id.hour',
            'room': '$_id.room',
            'temp': '$temp',
            'humidity': '$humidity',
            'light': '$light',
            'carbon': '$carbon',
            'occupied': '$occupied'
        }}
    ])
    db.statistics.remove({})
    db.statistics.insert_many(stats)

def sigusr1_handler(signum, frame):
    # handle SIGUSR1 signal for forced loop iteration
    pass

if __name__ == '__main__':
    signal.signal(signal.SIGUSR1, sigusr1_handler)
    while True:
        update_hourly_averages()
        time.sleep(MAIN_LOOP_INTERVAL.total_seconds())
