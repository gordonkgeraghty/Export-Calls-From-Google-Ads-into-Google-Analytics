function main(){
//variables for report
var dateRange = 'YESTERDAY';
var columns = ['CampaignName','ConversionTypeName','Conversions','ConversionValue'];
var columnsStr = columns.join(',') + " ";
//run report
var reportData = AdWordsApp.report(
'SELECT ' + columnsStr +
'FROM CAMPAIGN_PERFORMANCE_REPORT ' +
'WHERE ConversionTypeName CONTAINS_IGNORE_CASE "calls from ads" ' + //filter to just conversions with "calls" in the name, adjust this to match your conversion names
'DURING ' + dateRange);
var rows = reportData.rows()
//function to create random UUID
function uuid() {
return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
return v.toString(16);
});
}
//variables for measurement protocol
var GAID = 'UA-xxxxxx-x'; //replace this with your GA Property ID
var campaignSource = 'google'; //ensures the GA goal is attributed to Google
var campaignMedium = 'cpc'; //ensures the GA goal is attributed to paid search
var eventCat = 'Google%20Ads%20Conversion'; //change this to edit the Event Category, maintaining URL Encoding<be> var eventAct = 'Calls from ads'; //change this to edit the Event action, maintaining URL Encoding var postURL = 'https://www.google-analytics.com/collect';
var queueTime = 12600000; //3.5 hours in milliseconds so we can send the data at 2am and it is assigned to the previous day
var hostName = '{{hostname}}'; // replace this with the hostname of client's webiste

//loop to build measurement protocol from each row of report data
while (rows.hasNext()){
var row = rows.next();
var campaignName = encodeURI(row['CampaignName']); //encodes for use in URL
var conversionType = encodeURI(row['ConversionTypeName']).toLowerCase(); //encodes for use in URL and makes them lowercase to match existing GA event structure, change if necessary
var conversionCount = Math.round(row['Conversions']); //round the number of conversions to a whole number, remove rounding if you are using a fractional attribution model
var conversionValue = row['ConversionValue']/conversionCount; //the value of each individual conversion - *on the assumption that all conversions have the same value
//for each conversion, create & send measurement protocol
for (i=0; i<conversionCount; i++){
//generate random client id
var clientID = uuid();
//construct measurment protocol payload
var payload = 'v=1&t=event&ni=1' +
'&tid=' + GAID +
'&cid=' + clientID +
'&cs=' + campaignSource +
'&cm=' + campaignMedium +
'&cn=' + campaignName +
'&ec=' + eventCat +
'&ea=' + conversionType +
'&ev=' + conversionValue +
'&qt=' + queueTime;
'&dh=' + hostName;
//log URL for debugging
Logger.log(postURL+payload);
//send measurement protocol
var options = {
'method': 'POST',
'payload': payload
};
UrlFetchApp.fetch(postURL,options);
}
}
}
