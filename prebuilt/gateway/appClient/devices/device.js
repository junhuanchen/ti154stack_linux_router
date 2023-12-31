/******************************************************************************

 @file device.js

 @brief device specific functions

 Group: WCS LPC
 $Target Device: DEVICES $

 ******************************************************************************
 $License: BSD3 2016 $
 ******************************************************************************
 $Release Name: PACKAGE NAME $
 $Release Date: PACKAGE RELEASE DATE $
 *****************************************************************************/

/********************************************************************
 * Variables
 * *****************************************************************/
var fs = require("fs");

/********************************************************************
 * Defines
 * *****************************************************************/
const Smsgs_dataFields = Object.freeze({
    tempSensor: 0x0001,
    lightSensor: 0x0002,
    humiditySensor: 0x0004,
    msgStats: 0x0008,
    configSettings: 0x0010,
});

const STATUS_SUCCESS = 0;

/* Toggle debug print statements */
const PRINT_DEBUG = false;

/*!
 * @brief      Constructor for device objects
 *
 * @param      shortAddress - 16 bit address of the device
 * 			   extAddress - 64 bit IEEE address of the device
 * 			   capabilityInfo - device capability information
 *
 * @retun      device object
 */
function Device(shortAddress, extAddress, capabilityInfo) {
    if(PRINT_DEBUG) console.log("In device, Device()");
    var devInfo = this;
    devInfo.shortAddress = shortAddress;
    devInfo.extAddress = extAddress;
    devInfo.capabilityInfo = capabilityInfo;
    devInfo.active = 'true';

    if(PRINT_DEBUG) console.log(devInfo);
    return devInfo;
}

/* Prototype Functions */
Device.prototype.rxSensorData = function (sensorData) {
    /* recieved message from the device, set as active */
    this.active = 'true';
	/* Check the support sensor Types and
	add information elements for those */
    if (sensorData.frameControl & Smsgs_dataFields.tempSensor){
        /* update the sensor values */
        this.temperaturesensor = {
            ambienceTemp: sensorData.tempSensor.ambienceTemp,
            objectTemp: sensorData.tempSensor.objectTemp
        };
    }
    if (sensorData.frameControl & Smsgs_dataFields.lightSensor) {
        /* update the sensor values */
        this.lightsensor = {
            rawData: sensorData.lightSensor.rawData
        };
    }
    if (sensorData.frameControl & Smsgs_dataFields.humiditySensor) {
        /* update the sensor values */
        this.humiditysensor = {
            temp: sensorData.humiditySensor.temp,
            humidity: sensorData.humiditySensor.humidity
        };
    }
    /* update rssi information */
    this.rssi = sensorData.rssi;
}

Device.prototype.rxConfigRspInd = function (devConfigData) {
    var device = this;
    if (devConfigData.status == STATUS_SUCCESS) {
        device.active = 'true';
		/* Check the support sensor Types and add
		information elements for those */
        if (devConfigData.frameControl & Smsgs_dataFields.tempSensor) {
            /* initialize sensor information element */
            device.temperaturesensor = {
                ambienceTemp: 0,
                objectTemp: 0
            };
        }
        if (devConfigData.frameControl & Smsgs_dataFields.lightSensor) {
            /* initialize sensor information element */
            device.lightsensor = {
                rawData: 0
            };
        }
        if (devConfigData.frameControl & Smsgs_dataFields.humiditySensor) {
            /* initialize sensor information element */
            device.humiditysensor = {
                temp: 0,
                humidity: 0
            };
        }
        device.reportingInterval = devConfigData.reportingInterval;
        if (device.capabilityInfo.rxOnWhenIdle == 1) {
            device.pollingInterval = devConfigData.pollingInterval;
        }
        else {
            device.pollingInterval = "always on device";
        }
    }
}

Device.prototype.deviceNotActive = function (inactiveDevInfo) {
    this.active = 'false';
}

Device.prototype.devUpdateInfo = function (shortAddr, capInfo) {
    this.shortAddress = shortAddr;
    this.capabilityInfo = capInfo;
    this.active = 'true';
}

module.exports = Device;
