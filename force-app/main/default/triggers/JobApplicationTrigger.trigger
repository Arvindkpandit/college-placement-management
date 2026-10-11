trigger JobApplicationTrigger on Job_Application__c (before insert) {

    if (Trigger.isBefore && Trigger.isInsert) {

        JobApplicationTriggerHandler.beforeInsert(Trigger.new);
    }
}