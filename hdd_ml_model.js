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

  var outputObj = {};
  var featureList = 'failure smart5 smart9 smart187 smart192 smart194 smart197 smart198';
  outputObj.smart5 = '0';
  outputObj.smart9 = '0';
  outputObj.smart187 = '0';
  outputObj.smart192 = '0';
  outputObj.smart194 = '0';
  outputObj.smart197 = '0';
  outputObj.smart198 = '0';

  //outputObj.featureVal = '1 ';

  var inputObj = jsonObj.susiCommData.data.HDDMonitor.hddSmartInfoList;
  //var inputObj = jsonObj.susiCommData.data.HDDMonitor;
  //console.log('input msg=' + JSON.stringify(inputObj));

  getFeatureObj( inputObj, outputObj );
  var featureVal = '0 ' + outputObj.smart5 + ' ' + outputObj.smart9 + ' ' + outputObj.smart187 + ' ' + outputObj.smart192 + ' ' + outputObj.smart194 + ' ' + outputObj.smart197 + ' ' + outputObj.smart198; 
  console.log('featureList =' + featureList);
  console.log('featureVal =' + featureVal);
  

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
    responsObj = JSON.parse(data);
    //responsObj.SessionID = 12345;

    sendToMqttBroker('/ML_HDD/'+ deviceID + '/predict_result', JSON.stringify(responsObj));
  });
})

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

