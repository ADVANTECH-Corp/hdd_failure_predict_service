#How to deploy HDD failure predict container

- Step1: Install Docker on x86 Ubuntu
https://docs.docker.com/engine/installation/linux/ubuntulinux/

- Step2: run [deploy_hdd_failure_predict_container.sh](https://github.com/ADVANTECH-Corp/hdd_failure_predict_service/blob/master/deploy_hdd_failure_predict_container.sh) to deploy `mqtt-bus` and `hdd_failure_predict` containers
<pre>
$ ./deploy_hdd_failure_predict_container.sh
</pre>

#How to get mqtt-bus IP

- Step1: find `mqtt-bus` container ID
<pre>
$ sudo docker ps
</pre> 

![result link](https://github.com/ADVANTECH-Corp/hdd_failure_predict_service/blob/master/images/docker_20161202_2.png)

- Step2: using `container ID` to get `mqtt-bus` IP
<pre>
$ sudo docker inspect \<container ID\>
</pre>

![result link](https://github.com/ADVANTECH-Corp/hdd_failure_predict_service/blob/master/images/docker_20161202_3.png)

#How to test HDD failure predict container

![result link](https://github.com/ADVANTECH-Corp/hdd_failure_predict_service/blob/master/images/docker_20161202_1.png)

- Step1: import below `node-red client` and run on the host PC.

![result link](https://github.com/ADVANTECH-Corp/hdd_failure_predict_service/blob/master/images/docker_20161202_4.png)

<pre>
[
	{
		"id": "1df371ec.8592f6",
		"type": "mqtt out",
		"z": "e340ed1b.582a2",
		"name": "ML_predict",
		"topic": "/cagent/admin/12377/deviceinfo",
		"qos": "0",
		"retain": "",
		"broker": "1f642e99.b3a9e1",
		"x": 423,
		"y": 115,
		"wires": []
	},
	{
		"id": "3c1b0529.23d2c2",
		"type": "debug",
		"z": "e340ed1b.582a2",
		"name": "",
		"active": true,
		"console": "false",
		"complete": "false",
		"x": 411,
		"y": 200,
		"wires": []
	},
	{
		"id": "8fd5c274.07c52",
		"type": "mqtt in",
		"z": "e340ed1b.582a2",
		"name": "ML_predict_result",
		"topic": "/ML_HDD/+/predict_result",
		"qos": "0",
		"broker": "1f642e99.b3a9e1",
		"x": 150,
		"y": 200,
		"wires": [
			[
				"3c1b0529.23d2c2"
			]
		]
	},
	{
		"id": "76fa3931.23a138",
		"type": "inject",
		"z": "e340ed1b.582a2",
		"name": "test data 1",
		"topic": "/ML_HDD/12345/predict",
		"payload": "{\"susiCommData\":{\"data\":{\"HDDMonitor\":{\"hddInfoList\":[{\"e\":[{\"n\":\"hddType\",\"sv\":\"STDDisk\"},{\"n\":\"hddName\",\"sv\":\"ST9250315AS\"},{\"n\":\"hddIndex\",\"v\":0},{\"n\":\"powerOnTime\",\"v\":14243,\"u\":\"hour\"},{\"n\":\"hddHealthPercent\",\"v\":100,\"u\":\"percent\"},{\"n\":\"hddTemp\",\"v\":31,\"u\":\"celsius\"}],\"bn\":\"Disk0-ST9250315AS\",\"ver\":1,\"asm\":\"R\"}],\"hddSmartInfoList\":[{\"BaseInfo\":{\"e\":[{\"n\":\"hddType\",\"sv\":\"STDDisk\"},{\"n\":\"hddName\",\"sv\":\"ST9250315AS\"},{\"n\":\"hddIndex\",\"v\":0}],\"bn\":\"BaseInfo\",\"asm\":\"R\"},\"FreeFallProtection\":{\"e\":[{\"n\":\"type\",\"v\":5},{\"n\":\"flags\",\"v\":12800},{\"n\":\"worst\",\"v\":100},{\"n\":\"value\",\"v\":100},{\"n\":\"vendorData\",\"sv\":\"00000000FD08\"}],\"bn\":\"FreeFallProtection\",\"asm\":\"R\"},\"UltraDMACRCErrorCount\":{\"e\":[{\"n\":\"type\",\"v\":9},{\"n\":\"flags\",\"v\":15872},{\"n\":\"worst\",\"v\":200},{\"n\":\"value\",\"v\":200},{\"n\":\"vendorData\",\"sv\":\"000000004E71\"}],\"bn\":\"UltraDMACRCErrorCount\",\"asm\":\"R\"},\"UncorrectableSectorCount\":{\"e\":[{\"n\":\"type\",\"v\":198},{\"n\":\"flags\",\"v\":4096},{\"n\":\"worst\",\"v\":100},{\"n\":\"value\",\"v\":100},{\"n\":\"vendorData\",\"sv\":\"000000000038\"}],\"bn\":\"UncorrectableSectorCount\",\"asm\":\"R\"},\"CurrentPendingSectorCount\":{\"e\":[{\"n\":\"type\",\"v\":197},{\"n\":\"flags\",\"v\":4608},{\"n\":\"worst\",\"v\":100},{\"n\":\"value\",\"v\":100},{\"n\":\"vendorData\",\"sv\":\"000000000038\"}],\"bn\":\"CurrentPendingSectorCount\",\"asm\":\"R\"},\"HardwareECCRecovered\":{\"e\":[{\"n\":\"type\",\"v\":187},{\"n\":\"flags\",\"v\":6656},{\"n\":\"worst\",\"v\":45},{\"n\":\"value\",\"v\":47},{\"n\":\"vendorData\",\"sv\":\"000000000349\"}],\"bn\":\"HardwareECCRecovered\",\"asm\":\"R\"},\"Temperature\":{\"e\":[{\"n\":\"type\",\"v\":194},{\"n\":\"flags\",\"v\":8704},{\"n\":\"worst\",\"v\":43},{\"n\":\"value\",\"v\":31},{\"n\":\"vendorData\",\"sv\":\"000000000016\"}],\"bn\":\"Temperature\",\"asm\":\"R\"},\"LoadCycleCount\":{\"e\":[{\"n\":\"type\",\"v\":193},{\"n\":\"flags\",\"v\":12800},{\"n\":\"worst\",\"v\":1},{\"n\":\"value\",\"v\":1},{\"n\":\"vendorData\",\"sv\":\"0000000356EC\"}],\"bn\":\"LoadCycleCount\",\"asm\":\"R\"},\"PoweroffRetractCount\":{\"e\":[{\"n\":\"type\",\"v\":192},{\"n\":\"flags\",\"v\":12800},{\"n\":\"worst\",\"v\":100},{\"n\":\"value\",\"v\":100},{\"n\":\"vendorData\",\"sv\":\"000000000008\"}],\"bn\":\"PoweroffRetractCount\",\"asm\":\"R\"}}]}}}}",
		"payloadType": "json",
		"repeat": "",
		"crontab": "",
		"once": false,
		"x": 146,
		"y": 115,
		"wires": [
			[
				"1df371ec.8592f6"
			]
		]
	},
	{
		"id": "1f642e99.b3a9e1",
		"type": "mqtt-broker",
		"z": "",
		"broker": "127.0.0.1",
		"port": "1883",
		"clientid": "",
		"usetls": false,
		"compatmode": true,
		"keepalive": "60",
		"cleansession": true,
		"willTopic": "",
		"willQos": "0",
		"willPayload": "",
		"birthTopic": "",
		"birthQos": "0",
		"birthPayload": ""
	}
]
</pre>


- Step2: set `mqtt-bus` IP to `node-red client`
- Step3: trigger `node-red client` to send simulate data to `mqtt-bus` container.
