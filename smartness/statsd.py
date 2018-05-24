#!/usr/bin/python3
import pymongo
import datetime
import signal
import time
import os

# configuration and parameters
MAIN_LOOP_INTERVAL = datetime.timedelta(minutes=15)
UNBOUND_STALE_MEASURES_TIME_DELTA = datetime.timedelta(hours=1)

# database connection
client = pymongo.MongoClient(os.environ['MONGO']) if 'MONGO' in os.environ else pymongo.MongoClient()
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
    try:
        db.statistics.insert_many(stats)
    except pymongo.errors.InvalidOperation:
        pass

def cleanup_unbound_stale_measures():
    scheduled_cleanup = datetime.datetime.utcnow() - UNBOUND_STALE_MEASURES_TIME_DELTA
    db.measures.delete_many({'room': None, 'timestamp': {'$lt': scheduled_cleanup}})

def sigusr1_handler(signum, frame):
    # handle SIGUSR1 signal for forced loop iteration
    pass

if __name__ == '__main__':
    signal.signal(signal.SIGUSR1, sigusr1_handler)
    while True:
        update_hourly_averages()
        cleanup_unbound_stale_measures()
        time.sleep(MAIN_LOOP_INTERVAL.total_seconds())
