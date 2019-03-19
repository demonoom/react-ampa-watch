#! /bin/bash
while true; do
    {
        node LittleantMobileHttpsServer.js
        echo "LittleantMobileHttpsServer stopped unexpected, restarting"
        sleep 1
    }
done
