#! /bin/bash
while true; do
    {
        node LittleantMobileServer.js
        echo "LittleantMobileServer stopped unexpected, restarting"
        sleep 1
    }
done
