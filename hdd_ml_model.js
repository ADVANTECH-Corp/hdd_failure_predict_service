var mqtt = require('mqtt');
var fs = require('fs');
var spawn = require('child_process').spawn

var keypress = require('keypress');

// make `process.stdin` begin emitting "keypress" events
keypress(process.stdin);

// listen for the "keypress" event
process.stdin.on('keypress', function (ch, key) {
  //console.log('got "keypress"', key);
  if (key && key.ctrl && key.name == 'c') {
    process.exit();
  }
});

process.stdin.setRawMode(true);
process.stdin.resume();

try{
  var mqtt_server = fs.readFileSync( 'mqtt_server.conf', 'utf8');
  //remove /r/n
  var mqtt_server = mqtt_server.toString().replace(/(?:\\[rn])+/g,'');
  //remove space
  var mqtt_server = mqtt_server.toString().replace(/\s+/g,'');  
}
catch(e){
  console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!!');
  console.error(e);
  process.exit();
}

var client  = mqtt.connect('mqtt://' + mqtt_server);
client.queueQoSZero = false;

client.on('connect', function () {
  console.log('mqtt connect to ' + mqtt_server );
  client.subscribe('/cagent/admin/+/deviceinfo');

  //sendToMqttBroker('/ML_HDD/12345/predict_result', 'ML_model response');
})


client.on('message', function (topic, message) {
  
  try {
      var jsonObj = JSON.parse(message.toString());
  } catch (e) {
      console.error(e);
      return;
  }

  if ( typeof jsonObj.susiCommData === 'undefined' ){
    return;
  }
  if ( typeof jsonObj.susiCommData.data === 'undefined' ){
    return;
  }
  if ( typeof jsonObj.susiCommData.data.HDDMonitor === 'undefined' ){
    return;
  }
  if ( typeof jsonObj.susiCommData.data.HDDMonitor.hddSmartInfoList === 'undefined' ){
    return;
  }

  console.log('--------------------------receive mqtt message------------------------------');
  console.log('topic=' + topic.toString() );
  console.log('msg=' + message.toString());
  var deviceID = topic.toString().split('/')[3];

  //predict(deviceID, jsonObj);

  var hddNum = jsonObj.susiCommData.data.HDDMonitor.hddSmartInfoList.length;
  console.log('hddNum = ' + hddNum);
  for (var i = 0; i < hddNum; i++) { 
    //console.log(jsonObj["susiCommData"]["data"]["HDDMonitor"]["hddSmartInfoList"][i]); 
    predict(deviceID, jsonObj["susiCommData"]["data"]["HDDMonitor"]["hddSmartInfoList"][i]);
  }

})

function predict( deviceID, jsonObj){

  var outputObj = {};
  var featureList = 'failure smart5 smart9 smart187 smart192 smart197';
  outputObj.smart5 = '0';
  outputObj.smart9 = '0';
  outputObj.smart187 = '0';
  outputObj.smart192 = '0';
  outputObj.smart194 = '0';
  outputObj.smart197 = '0';
  outputObj.smart198 = '0';
  outputObj.smart199 = '0';
  outputObj.smart191 = '0';
  outputObj.smart173 = '0';

  var inputObj = jsonObj;
  var baseInfoObj = jsonObj.BaseInfo;
  var hddName;
  //console.log(baseInfoObj);

  /* get hddName */
  for (var i = 0; i < baseInfoObj["e"].length; i++) {

    if ( baseInfoObj["e"][i].n === 'hddName'){
      //console.log('============ baseInfoObj.e i= ' + i);
      console.log('hddName => baseInfoObj["e"]['+ i +'].sv = ' + baseInfoObj["e"][i].sv);
      hddName = baseInfoObj["e"][i].sv;
    } 
  }

  //var inputObj = jsonObj.susiCommData.data.HDDMonitor;
  //console.log('input msg=' + JSON.stringify(inputObj));
  console.log('!!!!! >>>>>>>>>>>>>');

  getFeatureObj( inputObj, outputObj );
  var featureVal = '0 ' + outputObj.smart5 + ' ' + outputObj.smart9 + ' ' + outputObj.smart187 + ' ' + outputObj.smart192 + ' ' + ' ' + outputObj.smart197 ; 
  console.log('featureList =' + featureList);
  console.log('featureVal =' + featureVal);
 
  /* Alert1 value */ 
  var alert_1 = 0;
  if ( parseInt(outputObj.smart9 , 10) !== 0 ){
    alert_1 = parseInt(outputObj.smart199 , 10)/parseInt(outputObj.smart9 , 10);
  }
  console.log('Alert1 = ' + alert_1);
  /* Alert2 value */ 
  var alert_2 = 0;
  if ( parseInt(outputObj.smart9 , 10) !== 0 ){
    alert_2 = parseInt(outputObj.smart5 , 10)/parseInt(outputObj.smart9 , 10);
  }
  console.log('Alert2 = ' + alert_2);
  /* Alert3 value */ 
  var alert_3 = 0;
  if ( parseInt(outputObj.smart9 , 10) !== 0 ){
    alert_3 = parseInt(outputObj.smart187 , 10)/parseInt(outputObj.smart9 , 10);
  }
  console.log('Alert3 = ' + alert_3);
  /* Alert4 value */ 
  var alert_4 = 0;
  if ( parseInt(outputObj.smart9 , 10) !== 0 ){
    alert_4 = parseInt(outputObj.smart197 , 10)/parseInt(outputObj.smart9 , 10);
  }
  console.log('Alert4 = ' + alert_4);
  /* Alert5 value */ 
  var alert_5 = 0;
  if ( parseInt(outputObj.smart9 , 10) !== 0 ){
    alert_5 = parseInt(outputObj.smart198 , 10)/parseInt(outputObj.smart9 , 10);
  }
  console.log('Alert5 = ' + alert_5);
  /* Alert6 value */ 
  var alert_6 = 0;
  if ( parseInt(outputObj.smart9 , 10) !== 0 ){
    alert_6 = parseInt(outputObj.smart191 , 10)/parseInt(outputObj.smart9 , 10);
  }
  console.log('Alert6 = ' + alert_6);
  /* Alert7 value */ 
  var alert_7 = parseInt(outputObj.smart194 , 10);
  console.log('Alert7 = ' + alert_7);
  /* Alert8 value */ 
  var alert_8 = parseInt(outputObj.smart194 , 10);
  console.log('Alert8 = ' + alert_8);
  /* Alert9 value */ 
  var alert_9 = parseInt(outputObj.smart173 , 10);
  console.log('Alert9 = ' + alert_9);
  console.log('----------------------------------------------------------------------------');
  
  //sendToMqttBroker('/ML_HDD/12345/predict_result', 'ML_model response');
  
  //var feature_data ='failure smart5 smart9 smart187 smart192 smart194 smart197 smart198\n1 8 1761 4 0 30 0 0'
  var feature_data = featureList +'\r\n' + featureVal + '\r\n';
  fs.writeFileSync("./Feature.data", feature_data);

  /****************/
  var env = process.env
  var opts = { cwd: './',
               env: process.env
             }

  var RCall = ['--no-restore','--no-save','PredictionModel.R','111,222,333']
  var R  = spawn('Rscript', RCall, opts)

  R.on('exit',function(code){
    console.log('got exit code: '+code)
    if(code==1){
            // do something special
    }else{
    }
    return null
  })

  R.stdout.on('data', (data) => {
    console.log('stdout:' + data);
    var responsObj = {};
    responsObj[hddName]={};
    responsObj[hddName] = JSON.parse(data);
    responsObj[hddName]['Alert1'] = alert_1;
    responsObj[hddName]['Alert2'] = alert_2;
    responsObj[hddName]['Alert3'] = alert_3;
    responsObj[hddName]['Alert4'] = alert_4;
    responsObj[hddName]['Alert5'] = alert_5;
    responsObj[hddName]['Alert6'] = alert_6;
    responsObj[hddName]['Alert7'] = alert_7;
    responsObj[hddName]['Alert8'] = alert_8;
    responsObj[hddName]['Alert9'] = alert_9;
    //responsObj.SessionID = 12345;

    sendToMqttBroker('/ML_HDD/'+ deviceID + '/predict_result', JSON.stringify(responsObj));
  });
}

function sendToMqttBroker(topic, message){
  
  console.log('--------------------------send mqtt message------------------------------');
  console.log('topic=' + topic.toString() );
  console.log('msg=' + message.toString());
  console.log('-------------------------------------------------------------------------');
  
  client.publish(topic, message);
}


function getFeatureObj( jsonObj, outputObj ){
  
  for (key in jsonObj) {
    if (jsonObj.hasOwnProperty(key)) {
      //console.log( 'key =======>' + key + ', jsonKeyVal=======>' + JSON.stringify(jsonObj[key]));
      if ( key === 'e' ){
        console.log( '=============================================================>');
        var currentSmartID = '';
        for (var i = 0; i < jsonObj[key].length; i++) { 
          //console.log( 'key =======>' + key + ', jsonKeyVal=======>' + JSON.stringify(jsonObj[key][i]));
          if( jsonObj[key][i]['n'] !== 'undefined' ){
            //console.log( '1 ====== ' + JSON.stringify(jsonObj[key][i]['n']));
            
            if ( JSON.stringify(jsonObj[key][i]['n']) === '"type"'){          
              console.log( 'SMART ID =======>' + JSON.stringify(jsonObj[key][i]['v']));
              currentSmartID = JSON.stringify(jsonObj[key][i]['v']).toString();
              //outputObj.smart194 = '123';
            }
            if ( JSON.stringify(jsonObj[key][i]['n']) === '"vendorData"'){
              var rawData =  JSON.stringify(jsonObj[key][i]['sv']);
              rawData = rawData.replace('"','');
              rawData = parseInt(rawData,16);          
              console.log( 'rawData =======>' + rawData);
              if ( currentSmartID === '5' ){
                outputObj.smart5 = rawData;
              }
              if ( currentSmartID === '9' ){
                outputObj.smart9 = rawData;
              }
              if ( currentSmartID === '187' ){
                outputObj.smart187 = rawData;
              }
              if ( currentSmartID === '192' ){
                outputObj.smart192 = rawData;
              }
              if ( currentSmartID === '194' ){
                outputObj.smart194 = rawData;
              }
              if ( currentSmartID === '197' ){
                outputObj.smart197 = rawData;
              }
              if ( currentSmartID === '198' ){
                outputObj.smart198 = rawData;
              }
              if ( currentSmartID === '199' ){
                outputObj.smart199 = rawData;
              }
              if ( currentSmartID === '191' ){
                outputObj.smart191 = rawData;
              }
              if ( currentSmartID === '173' ){
                outputObj.smart173 = rawData;
              }
            }
            
          }
        }
      }
    }
  }
  //
  for (key in jsonObj) {
    if (jsonObj.hasOwnProperty(key)) {
      if (typeof jsonObj[key] === 'object' ){
        getFeatureObj( jsonObj[key], outputObj);
      }
    }
  }

  return;

}

