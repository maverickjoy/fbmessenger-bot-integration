const
  express     = require('express'),
  bodyParser  = require('body-parser'),
  request     = require('request'),
  config      = require('./configuration/config.json'),
  app         = express().use(bodyParser.json());



const handleMessage = function(sender_psid, received_message) {

  let response;
  if (received_message.text) {
    response = {
      "text": `YOU SENT : "${received_message.text}." !`
    }
  }
  else if (received_message.attachments) {
    let attachment_url = received_message.attachments[0].payload.url;
    response = {
      "attachment": {
        "type": "template",
        "payload": {
          "template_type": "generic",
          "elements": [{
            "title": "Is this the right picture?",
            "subtitle": "Tap a button to answer.",
            "image_url": attachment_url,
            "buttons": [
              {
                "type": "postback",
                "title": "Yes!",
                "payload": "yes",
              },
              {
                "type": "postback",
                "title": "No!",
                "payload": "no",
              }
            ],
          }]
        }
      }
    }
  }
  callSendAPI(sender_psid, response);
}



const handlePostback = function(sender_psid, received_postback) {
  // console.log("-------INSIDE HANDLE POSTBACK-------");
  let response;
  let payload = received_postback.payload;

  if (payload === 'yes') {
    response = { "text": "Thanks!" }
  } else if (payload === 'no') {
    response = { "text": "Oops, try sending another image." }
  }

  callSendAPI(sender_psid, response);
}



const callSendAPI = function(sender_psid, response) {
  // console.log("-------INSIDE SEND API-------");

 let request_body = {
   "recipient": {
     "id": sender_psid
   },
   "message": response
 }

 request({
   "uri": "https://graph.facebook.com/v2.6/me/messages",
   "qs": { "access_token": config.PAGE_ACCESS_TOKEN },
   "method": "POST",
   "json": request_body
 }, (err, res, body) => {
   if (!err) {
     console.log('message sent!')
     console.log("======================");
     console.log("");
     console.log("MSG : ", JSON.stringify(response, null, 4));
     console.log("");
     console.log("======================");
   } else {
     console.error("Unable to send message:" + err);
   }
 });

}


module.exports = {
  handleMessage   : handleMessage,
  handlePostback  : handlePostback,
  callSendAPI     : callSendAPI,
};
