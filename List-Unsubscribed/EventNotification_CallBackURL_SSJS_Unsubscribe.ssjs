<script runat="server">
  Platform.Load("Core","1");
  
  try{
    var jsonpost = Platform.Request.GetPostData(0);
    var json = Platform.Function.ParseJSON(jsonpost);
    
    var eventCategoryType = json[0].eventCategoryType;
    
    Write("The eventCategoryType is: " + eventCategoryType)
    if (eventCategoryType == "EngagementEvents.EmailUnsubscribe") {
      var MessageType = json[0].eventCategoryType;
      var messageKey = json[0].info.messageKey;
      var jobId = json[0].composite.jobId;
      var batchId = json[0].composite.batchId;
      var listId = json[0].composite.listId;
      var subscriberId = json[0].composite.subscriberId;
      var emailId = json[0].composite.emailId;
      var definitionKey = json[0].definitionKey;
      var mid = json[0].mid;
      var eid = json[0].eid;
      var Email = json[0].info.to;
      var subscriberKey = json[0].info.subscriberKey;
      var definitionId = json[0].definitionId;
      var compositeId = json[0].compositeId;
      var unsubscribeMethod = json[0].info.unsubscribeMethod
      
      var timestampUTC = json[0].timestampUTC;
      timestampUTC = new Date(timestampUTC);
      
      var unsubscribeDate = json[0].info.unsubscribeDate
      unsubscribeDate = new Date(unsubscribeDate);

      
      var insertResponse = Platform.Function.InsertData("Transactional_Event_Notification_Service",["MessageType","jobId","batchId","listId","subscriberId","emailId","definitionKey","mid","eid","Email","subscriberKey","definitionId","compositeId","timestampUTC", "unsubscribeMethod", "unsubscribeDate"],[MessageType,jobId,batchId,listId,subscriberId,emailId,definitionKey,mid,eid,Email,subscriberKey,definitionId,compositeId,timestampUTC, unsubscribeMethod, unsubscribeDate]);

      Variable.SetValue("@subscriberId",subscriberId);
</script>
%%[
OUTPUTLINE(CONCAT("This is the subscriberId: " ,@subscriberId))
SET @SubscriberKeyRows = LOOKUPROWS("ENT._Subscribers", "Subscriberid", @subscriberId)
SET @SubscriberKeyRowCount = ROWCOUNT(@SubscriberKeyRows)

IF @SubscriberKeyRowCount > 0 THEN 

    SET @SubscriberKeyRow = ROW(@SubscriberKeyRows, 1)
    SET @SubscriberKey    = FIELD(@SubscriberKeyRow, "SubscriberKey")
    OUTPUTLINE(CONCAT("This is the SubscriberKey: " ,@SubscriberKey))
ENDIF

set @CPTCRows = RetrieveSalesforceObjects(
                "ContactPointTypeConsent",
                "PrivacyConsentStatus, id, PartyId, relatedContact__c, CaptureDate", 
                "relatedContact__c", "=", @SubscriberKey,
                "ContactPointType", "=", "Email",
                "PrivacyConsentStatus", "=", "OptIn")

IF ROWCOUNT(@CPTCRows) > 0 THEN 

    SET @CPTCRow = ROW(@CPTCRows, 1)
    SET @CPTCid    = FIELD(@CPTCRow, "id")
    SET @updateCPTCRecord = UpdateSingleSalesforceObject(
                "ContactPointTypeConsent", @CPTCid,
                "PrivacyConsentStatus", "OptOut",
                "CaptureSource", "Email",
                "CaptureContactPointType", "Email",
                "EffectiveTo", FORMATDATE(NOW(),"iso"),
                "CaptureDate", FORMATDATE(NOW(),"iso")
                )
    OUTPUTLINE(CONCAT("This is the CPTCid: " ,@CPTCid))
ENDIF
]%%<script runat="server">
    } else { 
      var Weebhookinformation = DataExtension.Init("8D9E59EB-04FD-4075-9D9D-10A37030EECC");
      Weebhookinformation.Rows.Add({
        Message: Stringify(jsonpost)
      });
      Write("Valid Payload but not Unsubscribed Event")
    }
  } catch (error) {
    var Weebhookinformation = DataExtension.Init("8D9E59EB-04FD-4075-9D9D-10A37030EECC");
      Weebhookinformation.Rows.Add({
        Message: Stringify(error)
      });
    Write("There was an error")
    Write(Stringify(error))
  }
</script>