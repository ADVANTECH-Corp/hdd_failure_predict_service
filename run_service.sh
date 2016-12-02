#!/bin/sh
#Auto Run put it at /usr/local/bin and run prediction model
cd /home/adv/hdd_failure_predict
sudo git checkout tags/v0.0.1
node ./hdd_ml_model.js
