var AWS = require('aws-sdk');

AWS.config.update({
  region: 'eu-west-2',
  endpoint: 'http://localhost:8000',
});

var dynamodb = new AWS.DynamoDB();

var params = {
  TableName: 'ct152',
  KeySchema: [
    { AttributeName: 'accountId', KeyType: 'HASH' }, //Partition key
    { AttributeName: 'entity', KeyType: 'RANGE' }, //Sort key
  ],
  AttributeDefinitions: [
    { AttributeName: 'userId', AttributeType: 'S' },
    { AttributeName: 'entity', AttributeType: 'S' },
    { AttributeName: 'gsi', AttributeType: 'S' }
  ],
  ProvisionedThroughput: {
    ReadCapacityUnits: 5,
    WriteCapacityUnits: 5,
  },
  GlobalSecondaryIndexes: [
    {
      IndexName: 'gsi_1',
      KeySchema: [
        {
          AttributeName: 'entity',
          KeyType: 'HASH',
        },
        {
          AttributeName: 'gsi',
          KeyType: 'RANGE',
        },
      ],
      Projection: {
        ProjectionType: 'ALL',
      },
      ProvisionedThroughput: {
        ReadCapacityUnits: 1,
        WriteCapacityUnits: 1,
      },
    },
  ],
};

dynamodb.createTable(params, function (err, data) {
  if (err) {
    console.error(
      'Unable to create table. Error JSON:',
      JSON.stringify(err, null, 2)
    );
  } else {
    console.log(
      'Created table. Table description JSON:',
      JSON.stringify(data, null, 2)
    );
  }
});
