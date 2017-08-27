# Chatbot in Lambda

A Facebook Messenger Chatbot implements in NodeJS, hosting in AWS Lambda and using RiveScript for Natural Langugage Processing. It is full descibed in the Blog post titled [Giving Facebook Chatbot intelligence with RiveScript, NodeJS server running in AWS Lambda serverless architecture](https://blog.simonho.net/chatbot-a-i-programming-with-rivescript-server-running-nodejs-in-aws-lambda-using-serverless/).

## Download and install

```bash
$ git clone https://github.com/simonho288/rivescript-chatbot-lambda
$ cd rivescript-chatbot-lambda
$ npm install
$ touch aws.config.json
```

* Edit the "aws.config.json" file and put your AWS ACCESS KEY ID & SECRET inside like:
```json
{
  "accessKeyId": "<YOUR ACCESS_KEY_ID>",
  "secretAccessKey": "<YOUR ACCESS_KEY_SECRET>",
  "region": "<YOUR REGION>"
}
```

Run in local server
```bash
$ node server.js
```

You'll need to setup a HTTPS tunnel and copy the URL to Messenger webhook subscription. For full details, please refer to the Blog post mentioned above.

## URLs

Blog post:
https://blog.simonho.net/chatbot-a-i-programming-with-rivescript-server-running-nodejs-in-aws-lambda-using-serverless/

Facebook Page:
https://www.facebook.com/imsimonchatbot/
