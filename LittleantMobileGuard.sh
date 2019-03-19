#! /bin/bash
while true; do
    {
        node LittleAntWatchServer.js
        echo "LittleAntWatchServer stopped unexpected, restarting"
        sleep 1
    }
done
