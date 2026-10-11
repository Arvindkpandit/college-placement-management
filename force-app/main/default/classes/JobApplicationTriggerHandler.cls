public class JobApplicationTriggerHandler {

    public static void beforeInsert(
        List<Job_Application__c> newApplications
    ) {

        EligibilityService.checkEligibility(newApplications);
    }
}