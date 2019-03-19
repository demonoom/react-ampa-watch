#! /bin/bash
while true; do
    {
        node LittleAntWatchHttpsServer.js
        echo "LittleAntWatchHttpsServer stopped unexpected, restarting"
        sleep 1
    }
done
