public class EligibilityService {

    public static void checkEligibility(
        List<Job_Application__c> applications
    ) {

        // Store Student IDs and Job Opportunity IDs
        Set<Id> studentIds = new Set<Id>();
        Set<Id> jobIds = new Set<Id>();

        // Collect IDs from all applications
        for (Job_Application__c application : applications) {

            if (application.Student__c != null) {
                studentIds.add(application.Student__c);
            }

            if (application.Job_Opportunity__c != null) {
                jobIds.add(application.Job_Opportunity__c);
            }
        }

        // Get Student records
        Map<Id, Student__c> studentsMap =
            new Map<Id, Student__c>([
                SELECT Id, CGPA__c
                FROM Student__c
                WHERE Id IN :studentIds
            ]);

        // Get Job Opportunity records
        Map<Id, Job_Opportunity__c> jobsMap =
            new Map<Id, Job_Opportunity__c>([
                SELECT Id, Required_CGPA__c
                FROM Job_Opportunity__c
                WHERE Id IN :jobIds
            ]);

        // Check eligibility
        for (Job_Application__c application : applications) {

            Student__c student =
                studentsMap.get(application.Student__c);

            Job_Opportunity__c job =
                jobsMap.get(application.Job_Opportunity__c);

            if (student != null && job != null) {

                if (student.CGPA__c >= job.Required_CGPA__c) {

                    application.Eligibility_Status__c = 'Eligible';

                } else {

                    application.Eligibility_Status__c = 'Not Eligible';
                }
            }
        }
    }
}