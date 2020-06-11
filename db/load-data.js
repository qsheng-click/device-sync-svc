var AWS = require('aws-sdk');
var fs = require('fs');
var moment = require('moment');

AWS.config.update({
  region: 'us-east-2',
  endpoint: 'http://localhost:8000',
});

var docClient = new AWS.DynamoDB.DocumentClient();

console.log('Importing data into DynamoDB. Please wait.');

var items = JSON.parse(fs.readFileSync('v3.json', 'utf8'));

items.forEach(function (item) {
  console.log(item);

  var params = {
    TableName: 'ct152_v3',
    Item: {
      userId: item.userId,
      entity: item.entity,
      info: item.info,
      version: item.version,
      exerciseId: item.exerciseId,
      stageId: item.stageId,
      roundId: item.roundId,
      score: item.score,
      createdAt: moment.utc().format("YYYY-MM-DD HH:mm"),
      endTime: moment.utc().format("YYYY-MM-DD HH:mm"),
      n: item.n,
      id: item.id,
      lastUpdatedAt: item.lastUpdatedAt,
      version: item.version
    },
  };

  for (var key in item) {
    params.Item[key] = item[key];
  }


  docClient.put(params, function (err, data) {
    if (err) {
      console.error(
        'Unable to add item',
        item.entity,
        '. Error JSON:',
        JSON.stringify(err, null, 2)
      );
    } else {
      console.log('PutItem succeeded:', item.entity);
    }
  });
});
