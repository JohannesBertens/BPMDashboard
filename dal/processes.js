var request = require('request');
var btoa = function (str) {return new Buffer(str).toString('base64');};
var baseNeoURI = 'http://neo4j.databases.djbnjack.svc.tutum.io:8080';
var authorizationHeader = {	'Authorization': 'Basic ' + btoa("neo4j:vetman2") };  
var uuid = require('node-uuid');

function executeStatements(statements, callback){
  var options = {
    url: baseNeoURI + '/db/data/transaction/commit',
    headers: authorizationHeader,
    json: true,
    method: 'POST',
    body: { "statements" : statements}
  };
  
  request(options, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      callback(JSON.stringify(body.results[0].data, null, 2));
    }
  });
}

function getProcesses(callback) {
  var statement = 
  {
    "statement": "MATCH (n:node {type:'process'}) RETURN n",
    "resultDataContents":["row"]
  };
  
  executeStatements([statement], callback);
};

function getProcess(guid, callback) {
  var statement = 
  {
    "statement": "MATCH (n:node {type:'process', guid: '" + guid + "'}) RETURN n",
    "resultDataContents":["row"]
  };
  
  executeStatements([statement], callback);
}

function deleteProcess(guid, callback) {
  var statement = {	"statement": "MATCH (n:node {type:'process', guid: '" + guid + "'}) DETACH DELETE n" };
  executeStatements([statement], callback);
};

function deleteProcesses(callback) {
  var statement = {	"statement": "MATCH (n) DETACH DELETE n" };
  executeStatements([statement], callback);
};

function createProcess(callback) {
  var nodes = [
    "(z:node {name:'First Process', type:'process', state:'new', guid:'<GUID>'})",
    "(a:node {name:'Start', type:'start', state:'new'})",
    "(b:node {name:'Wait for approval', type:'input', state:'new'})",
    "(c:node {name:'End', type:'end', state:'new'})"
  ];

  var templateString = "";
  nodes.forEach(function(value, index, array){
    if (index < array.length-1){
      templateString += value + "-[:link]->";
    } else {
      templateString += value;
    }
  });

  var instanceString = templateString.replace(/<GUID>/g, uuid.v4());
  var statement = { "statement": "Create p="+instanceString };
  executeStatements([statement], callback);
}

module.exports.getProcesses = getProcesses;
module.exports.getProcess = getProcess;

module.exports.createProcess = createProcess;

module.exports.deleteProcesses = deleteProcesses;
module.exports.deleteProcess = deleteProcess;