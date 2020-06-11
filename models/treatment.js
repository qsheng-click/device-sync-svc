var AWS = require('aws-sdk');

AWS.config.update({
  region: 'us-east-1',
  endpoint: 'http://localhost:8000',
});

const dynamoDbClient = new AWS.DynamoDB();
const tableName = 'ct152_v3';

async function getAllExercises(userId) {
  try {
    const queryInput = queryExercisesInput(userId);
    return await dynamoDbClient.query(queryInput).promise();
  } catch (err) {
    handleQueryError(err);
  }
}

async function getUserData(userId) {
    try {
      const queryInput = queryUserDataInput(userId);
      return await dynamoDbClient.query(queryInput).promise();
    } catch (err) {
      handleQueryError(err);
    }
  }

async function addExercise(item) {
  try {
    const putItemInput = createExerciseInput(item);
    // console.log('putItemInput: ' + putItemInput);
    const putItemOutput = await dynamoDbClient.putItem(putItemInput).promise();
    console.info('Successfully put item.');
    // Handle putItemOutput
  } catch (err) {
    handlePutItemError(err);
  }
}


// Private functions

function queryExercisesInput(userId) {
  return {
    TableName: tableName,
    ScanIndexForward: false,
    ConsistentRead: false,
    KeyConditionExpression: '#d4340 = :d4340 And begins_with(#d4341, :d4341)',
    ExpressionAttributeValues: {
      ':d4340': {
        S: userId + '',
      },
      ':d4341': {
        S: 'exercise',
      },
    },
    ExpressionAttributeNames: {
      '#d4340': 'userId',
      '#d4341': 'entity',
    },
  };
}

function queryUserDataInput(userId) {
  return {
    TableName: tableName,
    ScanIndexForward: false,
    ConsistentRead: false,
    KeyConditionExpression: '#d4340 = :d4340',
    ExpressionAttributeValues: {
      ':d4340': {
        S: userId + '',
      },
    },
    ExpressionAttributeNames: {
      '#d4340': 'userId',
    },
  };
}

function createExerciseInput(item) {
  return {
    TableName: tableName,
    Item: {
      userId: {
        S: '1',
      },
      entity: {
        S: item.entity,
      },
      exerciseId: {
        S: '1',
      },
      info: {
        S: 'treatment#1',
      },
    },
    ConditionExpression: 'attribute_not_exists(#8bf20)',
    ExpressionAttributeNames: {
      '#8bf20': 'entity',
    },
  };
}

// Handles errors during Query execution. Use recommendations in error messages below to
// add error handling specific to your application use-case.
function handleQueryError(err) {
  if (!err) {
    console.error('Encountered error object was empty');
    return;
  }
  if (!err.code) {
    console.error(
      `An exception occurred, investigate and configure retry strategy. Error: ${JSON.stringify(
        err
      )}`
    );
    return;
  }
  // here are no API specific errors to handle for Query, common DynamoDB API errors are handled below
  handleCommonErrors(err);
}

function handlePutItemError(err) {
  if (!err) {
    console.error('Encountered error object was empty');
    return;
  }
  if (!err.code) {
    console.error(
      `An exception occurred, investigate and configure retry strategy. Error: ${JSON.stringify(
        err
      )}`
    );
    return;
  }
  switch (err.code) {
    case 'ConditionalCheckFailedException':
      console.error(
        `Condition check specified in the operation failed, review and update the condition check before retrying. Error: ${err.message}`
      );
      return;
    case 'TransactionConflictException':
      console.error(`Operation was rejected because there is an ongoing transaction for the item, generally safe to retry ' +
         'with exponential back-off. Error: ${err.message}`);
      return;
    case 'ItemCollectionSizeLimitExceededException':
      console.error(
        `An item collection is too large, you're using Local Secondary Index and exceeded size limit of` +
          `items per partition key. Consider using Global Secondary Index instead. Error: ${err.message}`
      );
      return;
    default:
      break;
    // Common DynamoDB API errors are handled below
  }
  handleCommonErrors(err);
}

function handleCommonErrors(err) {
  switch (err.code) {
    case 'InternalServerError':
      console.error(
        `Internal Server Error, generally safe to retry with exponential back-off. Error: ${err.message}`
      );
      return;
    case 'ProvisionedThroughputExceededException':
      console.error(
        `Request rate is too high. If you're using a custom retry strategy make sure to retry with exponential back-off.` +
          `Otherwise consider reducing frequency of requests or increasing provisioned capacity for your table or secondary index. Error: ${err.message}`
      );
      return;
    case 'ResourceNotFoundException':
      console.error(
        `One of the tables was not found, verify table exists before retrying. Error: ${err.message}`
      );
      return;
    case 'ServiceUnavailable':
      console.error(
        `Had trouble reaching DynamoDB. generally safe to retry with exponential back-off. Error: ${err.message}`
      );
      return;
    case 'ThrottlingException':
      console.error(
        `Request denied due to throttling, generally safe to retry with exponential back-off. Error: ${err.message}`
      );
      return;
    case 'UnrecognizedClientException':
      console.error(
        `The request signature is incorrect most likely due to an invalid AWS access key ID or secret key, fix before retrying.` +
          `Error: ${err.message}`
      );
      return;
    case 'ValidationException':
      console.error(
        `The input fails to satisfy the constraints specified by DynamoDB, ` +
          `fix input before retrying. Error: ${err.message}`
      );
      return;
    case 'RequestLimitExceeded':
      console.error(
        `Throughput exceeds the current throughput limit for your account, ` +
          `increase account level throughput before retrying. Error: ${err.message}`
      );
      return;
    default:
      console.error(
        `An exception occurred, investigate and configure retry strategy. Error: ${err.message}`
      );
      return;
  }
}

exports.getAllExercises = getAllExercises;
exports.getUserData = getUserData;
exports.addExercise = addExercise;
