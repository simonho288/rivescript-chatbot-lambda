# Chatbot in Lambda

A Facebook Messenger Chatbot implements in NodeJS, hosting in AWS Lambda and using RiveScript for Natural Langugage Processing. It is full descibed in the Blog post titled [Giving Facebook Chatbot intelligence with RiveScript, NodeJS server running in AWS Lambda serverless architecture](https://blog.simonho.net/2017/08/giving-facebook-chatbot-intelligence.html).

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

Run in local server environment
```bash
$ npm start
```

Deploy via serverless
```bash
$ npm deploy
```

You'll need to setup a HTTPS tunnel and copy the URL to Messenger webhook subscription. For full details, please refer to the Blog post mentioned above.

## URLs

Blog post:
https://blog.simonho.net/chatbot-a-i-programming-with-rivescript-server-running-nodejs-in-aws-lambda-using-serverless/

Facebook Page:
https://www.facebook.com/imsimonchatbot/

---

MIT License (MIT)
=====================

Copyright © 2017, Simon Ho

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the “Software”), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

