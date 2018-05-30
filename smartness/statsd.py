#!/usr/bin/python3
import pymongo
import datetime
import signal
import time
import os

# Configuration parameters
# interval between service loop iterations
MAIN_LOOP_INTERVAL = datetime.timedelta(minutes=15)
# measures of sensors not bound to rooms are cleaned up after this interval
UNBOUND_STALE_MEASURES_TIME_DELTA = datetime.timedelta(hours=1)

# Database connection
client = pymongo.MongoClient(os.environ['MONGO']) if 'MONGO' in os.environ else pymongo.MongoClient()
db = client['ewee']


def get_room_list():
    """Returns the list of room IDs.
    """
    return [room['_id'] for room in db.rooms.find({})]


def update_hourly_averages():
    """Updates the hourly averages of room status for all the current rooms.
    """
    # get current rooms
    room_ids = get_room_list()
    # aggregate hourly averages, day by day, for each room
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
    # workaround: older versions of mongodb don't support
    # the `out` stage in the previous pipeline
    db.statistics.remove({})
    try:
        db.statistics.insert_many(stats)
    except pymongo.errors.InvalidOperation:
        pass


def cleanup_unbound_stale_measures():
    """Remove old measures for unbound devices.
    """
    # cut-off timestamp
    scheduled_cleanup = datetime.datetime.utcnow() - UNBOUND_STALE_MEASURES_TIME_DELTA
    # delete all measures older than this
    db.measures.delete_many({'room': None, 'timestamp': {'$lt': scheduled_cleanup}})


def sigusr1_handler(signum, frame):
    """Handles USR1 signal to force loop iteration.
     - signum: signal code (unused)
     - frame: stack frame (unused)
    """
    # actually do nothing, already woken up from the sleep
    pass


if __name__ == '__main__':
    # set handler for USR1 signal
    signal.signal(signal.SIGUSR1, sigusr1_handler)
    # service infite loop
    while True:
        update_hourly_averages()
        cleanup_unbound_stale_measures()
        time.sleep(MAIN_LOOP_INTERVAL.total_seconds())
